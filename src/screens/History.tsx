import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    useWindowDimensions,
    Platform
} from 'react-native';
import {
    Search,
    ChevronLeft,
    CheckCircle2,
    Clock,
    GraduationCap,
    Users,
    Gift,
    Smartphone,
    Shield,
    User,
    PiggyBank,
    Heart,
    Plane,
    Zap,
    LayoutGrid,
    TrendingUp,
    Receipt,
    Utensils,
    Car,
    ShoppingBag,
    Home,
    Banknote
} from 'lucide-react-native';
import { Theme } from '../lib/theme';
import { fetchRealSheetData, TransactionRecord } from '../lib/data-service';
import { formatCurrency } from '../lib/utils';

interface HistoryProps {
    onNavigate: (screen: 'dash' | 'history' | 'stats' | 'settings') => void;
}

const History: React.FC<HistoryProps> = ({ onNavigate }) => {
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web' && width > 768;

    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<TransactionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Todo');

    const filters = ['Todo', 'Ingresos', 'Gastos', 'Ahorros'];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const data = await fetchRealSheetData();
        if (data) {
            setTransactions(data.history);
            setFilteredTransactions(data.history);
        }
        setIsLoading(false);
    };

    const getIcon = (category: string, type: string) => {
        const lower = category.toLowerCase();
        if (type === 'income') return TrendingUp;
        if (lower.includes('mercado') || lower.includes('comida') || lower.includes('restaurante')) return Utensils;
        if (lower.includes('transporte') || lower.includes('moto') || lower.includes('gasolina') || lower.includes('carro') || lower.includes('taxi')) return Car;
        if (lower.includes('arriendo') || lower.includes('vivienda') || lower.includes('casa') || lower.includes('hogar')) return Home;
        if (lower.includes('servicios') || lower.includes('luz') || lower.includes('agua') || lower.includes('gas')) return Zap;
        if (lower.includes('banco') || lower.includes('financiero') || lower.includes('tarjeta')) return ShoppingBag;
        if (lower.includes('educación') || lower.includes('estudio') || lower.includes('colegio') || lower.includes('aerografia')) return GraduationCap;
        if (lower.includes('spotify') || lower.includes('netflix') || lower.includes('entretenimiento') || lower.includes('ocio')) return LayoutGrid;
        if (lower.includes('celular') || lower.includes('teléfono') || lower.includes('plan')) return Smartphone;
        if (lower.includes('salud') || lower.includes('médico') || lower.includes('gym')) return Heart;
        if (lower.includes('familia') || lower.includes('hijos')) return Users;
        if (lower.includes('regalo') || lower.includes('navidad') || lower.includes('cumple')) return Gift;
        if (lower.includes('ahorro') || lower.includes('personal')) return PiggyBank;
        if (lower.includes('viaje')) return Plane;
        if (lower.includes('seguro') || lower.includes('soat') || lower.includes('protección') || lower.includes('imprevistos')) return Shield;
        return type === 'expense' ? Receipt : LayoutGrid;
    };

    const handleFilterPress = (filter: string) => {
        setActiveFilter(filter);
        if (filter === 'Todo') {
            setFilteredTransactions(transactions);
        } else {
            const filterMap: Record<string, string> = {
                'Ingresos': 'income',
                'Gastos': 'expense',
                'Ahorros': 'saving'
            };
            setFilteredTransactions(transactions.filter(t => t.type === filterMap[filter]));
        }
    };

    const TransactionItem = ({ title, category, sub, time, amount, status, icon: Icon, color }: any) => (
        <View style={styles.transactionCard}>
            <View style={[styles.iconContainer, { backgroundColor: Theme.colors.transparent.white }]}>
                <Icon color={Theme.colors.text.primary} size={22} />
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{title}</Text>
                <View style={styles.itemSubRow}>
                    <Text style={styles.itemCategory}>{category} • {time}</Text>
                    {status === 'sync' && (
                        <View style={styles.syncBadge}>
                            <CheckCircle2 size={12} color={Theme.colors.status.healthy} />
                            <Text style={styles.syncText}>SHEET</Text>
                        </View>
                    )}
                </View>
            </View>
            <Text style={[styles.itemAmount, { color: amount.startsWith('+') ? Theme.colors.status.healthy : Theme.colors.text.primary }]}>
                {amount}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={[styles.content, isWeb && { paddingLeft: 280 }]}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('dash')}>
                        <ChevronLeft color={Theme.colors.text.primary} size={28} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Historial</Text>
                    <View style={styles.onlineBadge}>
                        <CheckCircle2 size={14} color={Theme.colors.status.healthy} />
                        <Text style={styles.onlineText}>SINCRONIZADO</Text>
                    </View>
                </View>

                <View style={styles.searchContainer}>
                    <Search color={Theme.colors.text.muted} size={20} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar transacciones"
                        placeholderTextColor={Theme.colors.text.muted}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                activeFilter === filter && styles.filterChipActive
                            ]}
                            onPress={() => handleFilterPress(filter)}
                        >
                            {filter !== 'Todo' && <View style={styles.chipDot} />}
                            <Text style={[
                                styles.filterText,
                                activeFilter === filter && styles.filterTextActive
                            ]}>{filter}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.listScroll}>
                    {isLoading ? (
                        <View style={styles.processingCard}>
                            <Text style={styles.processingTitle}>Cargando historial...</Text>
                        </View>
                    ) : (
                        filteredTransactions.map((item, index) => (
                            <TransactionItem
                                key={index}
                                title={item.description || item.category}
                                category={item.category}
                                time={item.date}
                                amount={`${item.type === 'expense' ? '-' : '+'}${formatCurrency(item.amount)}`}
                                status="sync"
                                icon={getIcon(item.category, item.type)}
                            />
                        ))
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    content: {
        flex: 1,
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
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
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
    onlineText: {
        fontSize: 10,
        fontWeight: '800',
        color: Theme.colors.status.healthy,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.card,
        borderRadius: Theme.radius.md,
        paddingHorizontal: Theme.spacing.md,
        height: 52,
        marginBottom: Theme.spacing.lg,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    searchIcon: {
        marginRight: Theme.spacing.sm,
    },
    searchInput: {
        flex: 1,
        color: Theme.colors.text.primary,
        fontSize: 16,
    },
    filterScroll: {
        flexGrow: 0,
        marginBottom: Theme.spacing.xl,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: Theme.radius.full,
        backgroundColor: Theme.colors.card,
        marginRight: 10,
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
    chipDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Theme.colors.status.warning,
        marginRight: 8,
    },
    listScroll: {
        flex: 1,
    },
    dateHeader: {
        fontSize: 12,
        fontWeight: '800',
        color: Theme.colors.text.muted,
        marginBottom: Theme.spacing.md,
        letterSpacing: 1.5,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.card,
        borderRadius: Theme.radius.lg,
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: Theme.radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Theme.colors.text.primary,
        marginBottom: 2,
    },
    itemSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemCategory: {
        fontSize: 13,
        color: Theme.colors.text.muted,
    },
    syncBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    syncText: {
        fontSize: 10,
        fontWeight: '800',
        color: Theme.colors.status.healthy,
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: '800',
    },
    processingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.transparent.blue,
        borderRadius: Theme.radius.lg,
        padding: Theme.spacing.md,
        marginBottom: Theme.spacing.sm,
        borderWidth: 1,
        borderColor: Theme.colors.transparent.blue,
    },
    processingIconContainer: {
        width: 44,
        height: 44,
        borderRadius: Theme.radius.md,
        backgroundColor: Theme.colors.transparent.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
    },
    processingTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Theme.colors.text.primary,
        fontStyle: 'italic',
    },
    processingSub: {
        fontSize: 13,
        color: Theme.colors.text.secondary,
    },
    skeletonAmount: {
        width: 60,
        height: 14,
        borderRadius: 7,
        backgroundColor: 'rgba(255,255,255,0.05)',
    }
});

export default History;
