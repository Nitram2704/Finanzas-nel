import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    Platform,
    useWindowDimensions,
    TextInput
} from 'react-native';

import {
    Plus,
    Home,
    Car,
    Utensils,
    TrendingUp,
    Receipt,
    Search,
    LayoutGrid,
    Wallet,
    BarChart3,
    Settings as SettingsIcon,
    Maximize2,
    RotateCcw,
    GraduationCap,
    Users,
    Gift,
    Smartphone,
    Shield,
    User,
    PiggyBank,
    Heart,
    Plane,
    Zap
} from 'lucide-react-native';
import { Theme } from '../lib/theme';
import { fetchRealSheetData, FinancialTotals, TransactionRecord } from '../lib/data-service';
import { formatCurrency, getCurrentMonthName } from '../lib/utils';
import FabMenu from '../components/FabMenu';

interface DashboardProps {
    onAddPress: (type: 'income' | 'expense' | 'saving') => void;
    onNavigate: (screen: any) => void;
    currentScreen: string;
    refreshKey?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onAddPress, onNavigate, currentScreen, refreshKey }) => {
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web' && width > 768;

    const [totals, setTotals] = useState<FinancialTotals>({
        available: 0,
        income: 0,
        expenses: 0,
        savings: 0
    });
    const [monthlyBudget, setMonthlyBudget] = useState<any[]>([]);
    const [recentCategoryNames, setRecentCategoryNames] = useState<string[]>([]);
    const [showAllView, setShowAllView] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'Todo' | 'Gastos' | 'Ahorros'>('Todo');
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentScreen === 'budget') {
            setShowAllView(true);
        }
    }, [currentScreen]);

    useEffect(() => {
        loadData();
    }, [refreshKey]);

    const loadData = async () => {
        setIsLoading(true);
        const data = await fetchRealSheetData();
        if (data) {
            setTotals({
                available: data.totals.available,
                income: data.totals.income,
                expenses: data.totals.expenses,
                savings: data.totals.savings,
            });

            const spentMap: Record<string, number> = {};
            const backendSpentMap = data.spentMap;
            if (backendSpentMap) {
                Object.keys(backendSpentMap).forEach(key => {
                    spentMap[key.trim()] = backendSpentMap[key];
                });
            }

            const getIcon = (category: string) => {
                const lower = category.toLowerCase();
                if (lower.includes('mercado') || lower.includes('comida') || lower.includes('restaurante')) return Utensils;
                if (lower.includes('transporte') || lower.includes('moto') || lower.includes('gasolina') || lower.includes('carro') || lower.includes('taxi')) return Car;
                if (lower.includes('arriendo') || lower.includes('vivienda') || lower.includes('casa') || lower.includes('hogar')) return Home;
                if (lower.includes('servicios') || lower.includes('luz') || lower.includes('agua') || lower.includes('gas')) return Zap;
                if (lower.includes('banco') || lower.includes('financiero') || lower.includes('tarjeta')) return Wallet;
                if (lower.includes('educación') || lower.includes('estudio') || lower.includes('colegio') || lower.includes('aerografia')) return GraduationCap;
                if (lower.includes('spotify') || lower.includes('netflix') || lower.includes('entretenimiento') || lower.includes('ocio')) return LayoutGrid;
                if (lower.includes('celular') || lower.includes('teléfono') || lower.includes('plan')) return Smartphone;
                if (lower.includes('salud') || lower.includes('médico') || lower.includes('gym')) return Heart;
                if (lower.includes('familia') || lower.includes('hijos')) return Users;
                if (lower.includes('regalo') || lower.includes('navidad')) return Gift;
                if (lower.includes('ahorro') || lower.includes('personal')) return PiggyBank;
                if (lower.includes('viaje')) return Plane;
                if (lower.includes('seguro') || lower.includes('soat') || lower.includes('protección') || lower.includes('imprevistos')) return Shield;
                return LayoutGrid;
            };

            const limits: Record<string, number> = {};
            const budgetLimits = data.budgetLimits;
            if (budgetLimits) {
                Object.keys(budgetLimits).forEach(key => {
                    limits[key.trim()] = budgetLimits[key];
                });
            }

            const categoriesWithLimits = Object.keys(limits);

            const dynamicBudget = categoriesWithLimits.map(category => {
                const limit = limits[category] || 0;
                const spent = spentMap[category] || 0;
                const progress = limit > 0 ? spent / limit : 0;

                const isSaving = category.toLowerCase().includes('ahorro') ||
                    category.toLowerCase().includes('proteccion') ||
                    category.toLowerCase().includes('adecuaciones');

                let status = isSaving ? 'AHORRO' : 'DENTRO DEL LÍMITE';
                let color = isSaving ? Theme.colors.brand.blue : Theme.colors.status.healthy;

                if (!isSaving) {
                    if (progress > 1) {
                        status = 'EXCEDIDO';
                        color = Theme.colors.status.danger;
                    } else if (progress > 0.8) {
                        status = 'CERCA AL LÍMITE';
                        color = Theme.colors.status.warning;
                    }
                }

                return {
                    category: category.trim(),
                    sub: limit > 0 ? `Presupuesto: ${formatCurrency(limit)}` : 'Sin límite mensual',
                    spent,
                    limit: limit || spent || 1,
                    status,
                    remaining: limit > 0 ? `${Math.max(0, 100 - Math.round(progress * 100))}% restante` : 'Monto actual',
                    icon: getIcon(category),
                    color,
                    hideProgress: limit === 0,
                    isSaving
                };
            });

            const unexpected = Object.keys(spentMap)
                .filter(cat => !limits[cat])
                .map(category => {
                    const spent = spentMap[category];
                    return {
                        category,
                        sub: 'No presupuestado',
                        spent,
                        limit: spent,
                        status: 'GASTO ADICIONAL',
                        remaining: 'Consumo actual',
                        icon: getIcon(category),
                        color: Theme.colors.text.muted,
                        hideProgress: true
                    };
                });

            const totalBudget = [...dynamicBudget, ...unexpected]
                .sort((a, b) => {
                    if (a.status === 'EXCEDIDO' && b.status !== 'EXCEDIDO') return -1;
                    if (a.status !== 'EXCEDIDO' && b.status === 'EXCEDIDO') return 1;
                    if (a.status === 'CERCA AL LÍMITE' && b.status !== 'CERCA AL LÍMITE') return -1;
                    if (a.status !== 'CERCA AL LÍMITE' && b.status === 'CERCA AL LÍMITE') return 1;
                    return b.spent - a.spent;
                });

            setMonthlyBudget(totalBudget);

            const recent = (data.history || [])
                .filter((t: any) => t.type !== 'income' && t.category)
                .slice(0, 20);

            const uniqueRecent = Array.from(new Set(recent.map((t: any) => t.category.trim()))).slice(0, 3);
            setRecentCategoryNames(uniqueRecent);
        }
        setIsLoading(false);
    };

    const getTop3RecentCategories = () => {
        if (recentCategoryNames.length === 0) {
            return monthlyBudget.slice(0, 3);
        }

        const top3 = recentCategoryNames.map(name =>
            monthlyBudget.find(item => item.category === name)
        ).filter(Boolean);

        if (top3.length < 3) {
            const extra = monthlyBudget.filter(item => !recentCategoryNames.includes(item.category)).slice(0, 3 - top3.length);
            return [...top3, ...extra];
        }

        return top3;
    };

    const getFuzzyScore = (target: string, query: string) => {
        const s1 = target.toLowerCase().trim();
        const s2 = query.toLowerCase().trim();
        if (s1.includes(s2)) return 100;

        let matches = 0;
        const targetChars = s1.split('');
        for (const char of s2) {
            const idx = targetChars.indexOf(char);
            if (idx !== -1) {
                matches++;
                targetChars.splice(idx, 1);
            }
        }

        const similarity = (matches / s2.length) * 100;
        const lengthDiff = Math.abs(s1.length - s2.length);
        return Math.max(0, similarity - (lengthDiff * 2));
    };

    const filteredBudget = showAllView
        ? monthlyBudget
            .map(item => ({
                ...item,
                fuzzyScore: searchText ? getFuzzyScore(item.category, searchText) : 100
            }))
            .filter(item => {
                const matchesFilter = activeFilter === 'Todo' ||
                    (activeFilter === 'Gastos' && !item.isSaving) ||
                    (activeFilter === 'Ahorros' && item.isSaving);

                const matchesSearch = !searchText || item.fuzzyScore > 40;

                return matchesFilter && matchesSearch;
            })
            .sort((a, b) => {
                if (searchText) {
                    return b.fuzzyScore - a.fuzzyScore;
                }
                return 0;
            })
        : getTop3RecentCategories() as any[];

    const BudgetCard = ({ category, sub, spent, limit, status, remaining, icon: Icon, color, hideProgress }: any) => {
        const progress = Math.min(spent / limit, 1);

        return (
            <View style={styles.budgetCard}>
                <View style={styles.cardTop}>
                    <View style={styles.iconContainer}>
                        <Icon color={Theme.colors.text.primary} size={24} />
                    </View>
                    <View style={styles.cardHeaderInfo}>
                        <Text style={styles.categoryName} numberOfLines={1}>{category}</Text>
                        <Text style={styles.categorySub}>{sub}</Text>
                    </View>
                    <View style={styles.cardAmountInfo}>
                        <Text style={styles.amountSpent}>{formatCurrency(spent)}</Text>
                    </View>
                </View>

                {!hideProgress && (
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${progress * 100}%`, backgroundColor: color }
                            ]}
                        />
                    </View>
                )}

                <View style={styles.cardBottom}>
                    <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, { backgroundColor: color }]} />
                        <Text style={[styles.statusText, { color }]}>{status}</Text>
                    </View>
                    {!hideProgress && <Text style={styles.remainingText}>{remaining}</Text>}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    isWeb && { paddingLeft: 280 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <Text style={styles.headerTitle}>Nel</Text>
                    </View>
                    <View style={styles.onlineBadge}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>ONLINE</Text>
                    </View>
                </View>

                <View style={styles.balanceSection}>
                    <Text style={styles.balanceLabel}>SALDO DISPONIBLE</Text>
                    <Text style={styles.balanceAmount}>{formatCurrency(totals.available)}</Text>
                    <TouchableOpacity style={styles.syncButton} onPress={loadData} disabled={isLoading}>
                        <RotateCcw size={16} color={Theme.colors.brand.blueLight} />
                        <Text style={styles.syncText}>{isLoading ? 'Sincronizando...' : 'Actualizar Datos'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {showAllView ? `Presupuesto (${activeFilter})` : 'Presupuesto Mensual'}
                    </Text>
                    <TouchableOpacity onPress={() => setShowAllView(!showAllView)}>
                        <Text style={styles.viewAllText}>{showAllView ? 'Ver Menos' : 'Ver Todo'}</Text>
                    </TouchableOpacity>
                </View>

                {showAllView && (
                    <View style={styles.searchAndFilter}>
                        <View style={styles.searchContainer}>
                            <Search size={18} color={Theme.colors.text.muted} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar categoría..."
                                placeholderTextColor={Theme.colors.text.muted}
                                value={searchText}
                                onChangeText={setSearchText}
                                autoCorrect={false}
                                underlineColorAndroid="transparent"
                            />
                            {searchText.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchText('')}>
                                    <RotateCcw size={16} color={Theme.colors.text.muted} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                            {['Todo', 'Gastos', 'Ahorros'].map((f) => (
                                <TouchableOpacity
                                    key={f}
                                    style={[
                                        styles.filterChip,
                                        activeFilter === f && styles.filterChipActive
                                    ]}
                                    onPress={() => setActiveFilter(f as any)}
                                >
                                    <Text style={[
                                        styles.filterText,
                                        activeFilter === f && styles.filterTextActive
                                    ]}>{f}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {filteredBudget.map((item, index) => (
                    <BudgetCard key={index} {...item} />
                ))}

                {!showAllView && (
                    <>
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <View style={[styles.statIconContainer, { backgroundColor: Theme.colors.transparent.green }]}>
                                    <TrendingUp color={Theme.colors.status.healthy} size={20} />
                                </View>
                                <Text style={styles.statLabel}>INGRESOS MES</Text>
                                <Text style={styles.statValue}>{formatCurrency(totals.income)}</Text>
                            </View>
                            <View style={styles.statCard}>
                                <View style={[styles.statIconContainer, { backgroundColor: Theme.colors.transparent.red }]}>
                                    <Receipt color={Theme.colors.status.danger} size={20} />
                                </View>
                                <Text style={styles.statLabel}>GASTOS MES</Text>
                                <Text style={styles.statValue}>{formatCurrency(totals.expenses)}</Text>
                            </View>
                        </View>
                        <View style={{ height: 100 }} />
                    </>
                )}
            </ScrollView>

            <FabMenu onAction={onAddPress} />

            {!isWeb && (
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('dash')}>
                        <LayoutGrid color={currentScreen === 'dash' ? Theme.colors.brand.blue : Theme.colors.text.muted} size={24} />
                        <Text style={[styles.navText, currentScreen === 'dash' && { color: Theme.colors.brand.blue }]}>TABLERO</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('budget')}>
                        <Wallet color={currentScreen === 'budget' ? Theme.colors.brand.blue : Theme.colors.text.muted} size={24} />
                        <Text style={[styles.navText, currentScreen === 'budget' && { color: Theme.colors.brand.blue }]}>PRESUPUESTO</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('history')}>
                        <BarChart3 color={currentScreen === 'history' ? Theme.colors.brand.blue : Theme.colors.text.muted} size={24} />
                        <Text style={[styles.navText, currentScreen === 'history' && { color: Theme.colors.brand.blue }]}>HISTORIAL</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    scrollContent: {
        paddingHorizontal: Theme.spacing.lg,
        paddingTop: Theme.spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.xl,
        marginTop: Platform.OS === 'ios' ? 20 : 0,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Theme.spacing.sm,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Theme.colors.card,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Theme.colors.text.primary,
    },
    onlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.transparent.white,
        paddingHorizontal: Theme.spacing.sm,
        paddingVertical: Theme.spacing.xs,
        borderRadius: Theme.radius.full,
        gap: 6,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Theme.colors.status.healthy,
    },
    onlineText: {
        fontSize: 12,
        fontWeight: '700',
        color: Theme.colors.text.muted,
    },
    balanceSection: {
        alignItems: 'center',
        marginBottom: Theme.spacing.xxl,
    },
    balanceLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: Theme.colors.text.muted,
        letterSpacing: 1.5,
        marginBottom: Theme.spacing.sm,
    },
    balanceAmount: {
        fontSize: 52,
        fontWeight: '900',
        color: Theme.colors.text.primary,
        marginBottom: Theme.spacing.md,
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.transparent.blue,
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: Theme.spacing.sm,
        borderRadius: Theme.radius.full,
        gap: Theme.spacing.sm,
    },
    syncText: {
        color: Theme.colors.brand.blueLight,
        fontWeight: '600',
        fontSize: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Theme.colors.text.primary,
    },
    viewAllText: {
        color: Theme.colors.brand.blueLight,
        fontWeight: '600',
    },
    filterScroll: {
        flexGrow: 0,
    },
    searchAndFilter: {
        marginBottom: Theme.spacing.lg,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.card,
        borderRadius: Theme.radius.md,
        paddingHorizontal: Theme.spacing.md,
        height: 48,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        marginBottom: Theme.spacing.md,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        color: Theme.colors.text.primary,
        fontSize: 15,
        fontWeight: '500',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: Theme.radius.full,
        backgroundColor: Theme.colors.card,
        marginRight: 8,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    filterChipActive: {
        backgroundColor: Theme.colors.brand.blue,
        borderColor: Theme.colors.brand.blue,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: Theme.colors.text.primary,
    },
    filterTextActive: {
        color: '#FFF',
    },
    budgetCard: {
        backgroundColor: Theme.colors.card,
        borderRadius: Theme.radius.lg,
        padding: Theme.spacing.lg,
        marginBottom: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: Theme.radius.md,
        backgroundColor: Theme.colors.transparent.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
    },
    cardHeaderInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: '700',
        color: Theme.colors.text.primary,
    },
    categorySub: {
        fontSize: 14,
        color: Theme.colors.text.muted,
    },
    cardAmountInfo: {
        alignItems: 'flex-end',
    },
    amountSpent: {
        fontSize: 18,
        fontWeight: '800',
        color: Theme.colors.text.primary,
    },
    amountLimit: {
        fontSize: 14,
        color: Theme.colors.text.muted,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: Theme.colors.border,
        borderRadius: 3,
        marginBottom: Theme.spacing.sm,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '800',
    },
    remainingText: {
        fontSize: 12,
        color: Theme.colors.text.muted,
        fontStyle: 'italic',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: Theme.spacing.md,
        marginTop: Theme.spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: Theme.colors.card,
        borderRadius: Theme.radius.lg,
        padding: Theme.spacing.lg,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.sm,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: Theme.colors.text.muted,
        letterSpacing: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: Theme.colors.text.primary,
        marginTop: 4,
    },
    fab: {
        position: 'absolute',
        bottom: Platform.OS === 'web' ? 32 : 100,
        right: 24,
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: Theme.colors.brand.blueLight,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Theme.colors.brand.blue,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#0F0F0F',
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    navItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    navText: {
        fontSize: 10,
        fontWeight: '800',
        color: Theme.colors.text.muted,
    },
});

export default Dashboard;
