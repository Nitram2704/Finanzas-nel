/**
 * Google Apps Script Backend (v4 - Fix Permisos)
 */


function doPost(e) {
  try {
    const contents = e.postData.contents;
    if (!contents) throw new Error("Cuerpo de la petición vacío");
    
    const params = JSON.parse(contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Función para buscar hojas de forma más robusta (no sensible a mayúsculas)
    const getSheetSafe = (name) => {
      let sheet = ss.getSheetByName(name);
      if (sheet) return sheet;
      const all = ss.getSheets();
      for (let i = 0; i < all.length; i++) {
        if (all[i].getName().toLowerCase().trim() === name.toLowerCase().trim()) return all[i];
      }
      return null;
    };

    // RUTA: Guardar Transacción (Existente)
    const typeToSheet = {
      'income': 'Registro ingresos',
      'expense': 'Registro egresos',
      'saving': 'Registro ahorro'
    };
    
    const sheetName = typeToSheet[params.type] || 'Registro egresos';
    const sheet = getSheetSafe(sheetName);
    
    if (!sheet) throw new Error("No se encontró la pestaña '" + sheetName + "'. Revisa que exista en el Sheet.");
    
    sheet.appendRow([
      params.date || new Date().toISOString().split('T')[0],
      params.month || "",
      params.category || "General",
      params.amount || 0,
      params.description || ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const data = getSheetData(ss);
    const categories = getCategories(ss);
    
    const budgetLimits = getBudgetLimits(ss);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      ...data,
      categories,
      budgetLimits
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


// --- Funciones de Utilidad Globales ---
function parseAmount(val) {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === 'number') return val;
  // Limpieza robusta: ignoramos $, espacios.
  // En Colombia 1.200.000,00 -> Queremos 1200000
  let s = val.toString().replace(/[$\s]/g, "");
  
  // Si tiene puntos y comas (ej: 1.200,50), quitamos puntos y cambiamos coma por punto
  if (s.includes(".") && s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",")) {
    // Si solo tiene coma, podría ser decimal (1200,50) o mil (1,200)
    // Asumimos decimal si hay 2 dígitos después
    const parts = s.split(",");
    if (parts[1].length === 2) s = s.replace(",", ".");
    else s = s.replace(",", ""); // Asumimos mil
  } else if (s.match(/\.\d{3}/)) {
    // Si tiene punto seguido de 3 dígitos (ej: 1.200), es mil
    s = s.replace(/\./g, "");
  }
  
  return parseFloat(s) || 0;
}

function parseDate(d) {
  if (!d) return 0;
  if (d instanceof Date) return d.getTime();
  const s = d.toString();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s).getTime();
  const parts = s.split(/[\/\-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) return new Date(s).getTime(); 
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day).getTime();
  }
  return new Date(s).getTime() || 0;
}

function getSheetData(ss) {
  const getValues = (name) => {
    const all = ss.getSheets();
    let s = null;
    for (let i = 0; i < all.length; i++) {
      if (all[i].getName().toLowerCase().trim() === name.toLowerCase().trim()) {
        s = all[i];
        break;
      }
    }
    if (!s) return [];
    try {
      const data = s.getDataRange().getValues();
      return data.length > 1 ? data.slice(1) : [];
    } catch(e) { return []; }
  };

  const expenses = getValues("Registro egresos");
  const income = getValues("Registro ingresos");
  const savings = getValues("Registro ahorro");
  
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const history = [
    ...expenses.map(r => ({ type: 'expense', date: r[0], month: r[1], category: r[2], amount: parseAmount(r[3]), description: r[4] })),
    ...income.map(r => ({ type: 'income', date: r[0], month: r[1], category: r[2], amount: parseAmount(r[3]), description: r[4] })),
    ...savings.map(r => ({ type: 'saving', date: r[0], month: r[1], category: r[2], amount: parseAmount(r[3]), description: r[4] }))
  ].sort((a, b) => parseDate(b.date) - parseDate(a.date)).slice(0, 200);

  const currentMonthName = months[new Date().getMonth()].toLowerCase();
  
  const sumMonthly = (list) => {
    return list.reduce((acc, r) => {
      const rowMonth = (r[1] || "").toString().toLowerCase().trim();
      const rowDate = r[0];
      let isCurrentMonth = (rowMonth === currentMonthName);
      if (!isCurrentMonth && rowDate instanceof Date) {
        isCurrentMonth = (rowDate.getMonth() === new Date().getMonth() && rowDate.getFullYear() === new Date().getFullYear());
      }
      if (isCurrentMonth) return acc + parseAmount(r[3]);
      return acc;
    }, 0);
  };

  const getSpentByCategory = (lists) => {
    const map = {};
    lists.forEach(list => {
      list.forEach(r => {
        const rowMonth = (r[1] || "").toString().toLowerCase().trim();
        const rowDate = r[0];
        let isCurrentMonth = (rowMonth === currentMonthName);
        if (!isCurrentMonth && rowDate instanceof Date) {
          isCurrentMonth = (rowDate.getMonth() === new Date().getMonth() && rowDate.getFullYear() === new Date().getFullYear());
        }
        
        if (isCurrentMonth) {
          const category = (r[2] || "").toString().trim();
          if (category) {
            map[category] = (map[category] || 0) + parseAmount(r[3]);
          }
        }
      });
    });
    return map;
  };

  const spentMap = getSpentByCategory([expenses, savings]);
  const monthlyIncome = sumMonthly(income);
  const monthlyExpenses = sumMonthly(expenses);
  const monthlySavings = sumMonthly(savings);
  
  let totals = { 
    available: monthlyIncome - monthlyExpenses - monthlySavings,
    income: monthlyIncome, 
    expenses: monthlyExpenses, 
    savings: monthlySavings 
  };
  
  return { totals, history, spentMap };
}

function getCategories(ss) {
  const all = ss.getSheets();
  let sheet = null;
  const nameToFind = "Listas desplegables";
  for (let i = 0; i < all.length; i++) {
    if (all[i].getName().toLowerCase().trim() === nameToFind.toLowerCase().trim()) {
      sheet = all[i];
      break;
    }
  }
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return {};
  const rows = data.slice(1);
  return {
     months: rows.map(r => r[0]).filter(Boolean),
     expenses: rows.map(r => r[2]).filter(Boolean),
     income: rows.map(r => r[4]).filter(Boolean),
     savings: rows.map(r => r[6]).filter(Boolean)
  };
}

function getBudgetLimits(ss) {
  const all = ss.getSheets();
  let sheet = null;
  const nameToFind = "Presupuesto";
  for (let i = 0; i < all.length; i++) {
    if (all[i].getName().toLowerCase().trim() === nameToFind.toLowerCase().trim()) {
      sheet = all[i];
      break;
    }
  }
  if (!sheet) return {};
  
  const data = sheet.getDataRange().getValues();
  const limits = {};
  
  // Obtenemos todas las categorías válidas de las listas desplegables
  const allCats = getCategories(ss);
  const validCategorySet = new Set([
    ...allCats.expenses.map(c => c.toString().trim()),
    ...allCats.savings.map(c => c.toString().trim())
  ]);

  // Buscamos en toda la hoja para mayor flexibilidad
  data.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellText = cell?.toString().trim();
      if (cellText && validCategorySet.has(cellText)) {
        // Encontramos una categoría. Buscamos el valor numérico a la derecha.
        // El presupuesto mensual suele estar unas columnas a la derecha (Col D=3, N=13, V=21)
        // Probamos buscar el primer número que aparezca en esa fila después del nombre
        for (let i = colIndex + 1; i < row.length; i++) {
          const val = parseAmount(row[i]);
          if (val > 0) {
            limits[cellText] = val;
            break; // Tomamos el primer valor > 0 encontrado a la derecha
          }
        }
      }
    });
  });
  
  return limits;
}
