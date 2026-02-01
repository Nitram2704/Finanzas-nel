import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { X, Calendar, Check, Loader2, Search, RotateCcw } from 'lucide-react-native';
import { fetchSheetCategories, SheetCategories } from '../lib/data-service';

interface TransactionFormProps {
    isVisible: boolean;
    initialType: 'income' | 'expense' | 'saving';
    onClose: () => void;
    onSave: (data: any) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ isVisible, initialType, onClose, onSave }) => {
    const [type, setType] = useState<'income' | 'expense' | 'saving'>(initialType);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [allCategories, setAllCategories] = useState<SheetCategories | null>(null);
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (isVisible) {
            setType(initialType);
            loadCategories();
        }
    }, [isVisible, initialType]);

    const loadCategories = async () => {
        setIsLoading(true);
        const data = await fetchSheetCategories();
        if (data) setAllCategories(data);
        setIsLoading(false);
    };

    // Helper para búsqueda fuzzy
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

    const currentCategories = React.useMemo(() => {
        if (!allCategories) return [];
        let base: string[] = [];
        if (type === 'income') base = allCategories.income || [];
        else if (type === 'expense') base = allCategories.expenses || [];
        else if (type === 'saving') base = allCategories.savings || [];

        if (!searchText) return base;

        return base
            .map(cat => ({ name: cat, score: getFuzzyScore(cat, searchText) }))
            .filter(item => item.score > 40)
            .sort((a, b) => b.score - a.score)
            .map(item => item.name);
    }, [allCategories, type, searchText]);

    const handleSave = () => {
        onSave({ type, amount: parseFloat(amount), category, description, date });
        onClose();
    };

    const TypeButton = ({ label, value, activeColor }: { label: string, value: typeof type, activeColor: string }) => (
        <TouchableOpacity
            style={[
                styles.typeButton,
                type === value && { backgroundColor: activeColor, borderColor: activeColor }
            ]}
            onPress={() => setType(value)}
        >
            <Text style={[styles.typeText, type === value && { color: '#FFF' }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal visible={isVisible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Nuevo Registro</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X color="#374151" size={24} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.typeSelector}>
                            <TypeButton label="Ingreso" value="income" activeColor="#10B981" />
                            <TypeButton label="Gasto" value="expense" activeColor="#EF4444" />
                            <TypeButton label="Ahorro" value="saving" activeColor="#3B82F6" />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Monto</Text>
                            <View style={styles.amountInputContainer}>
                                <Text style={styles.currencySymbol}>$</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    value={amount}
                                    onChangeText={setAmount}
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    autoFocus
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Categoría</Text>

                            <View style={styles.searchContainer}>
                                <Search size={18} color="#9CA3AF" />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Buscar categoría..."
                                    placeholderTextColor="#9CA3AF"
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    autoCorrect={false}
                                />
                                {searchText.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchText('')}>
                                        <RotateCcw size={16} color="#9CA3AF" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {isLoading ? (
                                <View style={styles.loadingContainer}>
                                    <Loader2 color="#2563EB" size={24} />
                                    <Text style={styles.loadingText}>Cargando categorías...</Text>
                                </View>
                            ) : (
                                <View style={styles.categoryGrid}>
                                    {currentCategories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                                            onPress={() => setCategory(cat)}
                                        >
                                            <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Descripción</Text>
                            <TextInput
                                style={styles.textInput}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Ej. Compra semanal"
                            />
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Guardar</Text>
                        </TouchableOpacity>
                    </ScrollView>

                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    typeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        marginBottom: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 8,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 64,
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    categoryChipActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#2563EB',
    },
    categoryChipText: {
        fontSize: 14,
        color: '#4B5563',
    },
    categoryChipTextActive: {
        color: '#2563EB',
        fontWeight: '600',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    textInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
    },
    saveButton: {
        backgroundColor: '#2563EB',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default TransactionForm;
