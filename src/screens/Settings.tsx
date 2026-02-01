import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Switch,
    Platform,
    useWindowDimensions
} from 'react-native';
import {
    ChevronLeft,
    Database,
    FileText,
    Clock,
    RotateCcw,
    Maximize2,
    Cpu,
    Target,
    Coins,
    Bell,
    Trash2,
    ChevronRight
} from 'lucide-react-native';
import { Theme } from '../lib/theme';

interface SettingsProps {
    onNavigate: (screen: 'dash' | 'history' | 'stats' | 'settings') => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web' && width > 768;

    const [isSyncEnabled, setIsSyncEnabled] = useState(true);
    const [isAutoScanEnabled, setIsAutoScanEnabled] = useState(true);
    const [isHighPrecisionEnabled, setIsHighPrecisionEnabled] = useState(false);

    const SettingRow = ({ icon: Icon, label, sublabel, value, hasArrow = true, color = Theme.colors.text.primary }: any) => (
        <TouchableOpacity style={styles.settingRow}>
            <View style={[styles.settingIconContainer, { backgroundColor: Theme.colors.transparent.white }]}>
                <Icon color={color} size={20} />
            </View>
            <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{label}</Text>
                {sublabel && <Text style={styles.settingSublabel}>{sublabel}</Text>}
            </View>
            {value !== undefined ? (
                <Text style={styles.settingValue}>{value}</Text>
            ) : hasArrow ? (
                <ChevronRight color={Theme.colors.text.muted} size={20} />
            ) : null}
        </TouchableOpacity>
    );

    const SettingToggle = ({ icon: Icon, label, sublabel, enabled, onToggle }: any) => (
        <View style={styles.settingRow}>
            <View style={[styles.settingIconContainer, { backgroundColor: Theme.colors.transparent.white }]}>
                <Icon color={Theme.colors.text.primary} size={20} />
            </View>
            <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{label}</Text>
                {sublabel && <Text style={styles.settingSublabel}>{sublabel}</Text>}
            </View>
            <Switch
                value={enabled}
                onValueChange={onToggle}
                trackColor={{ false: '#374151', true: Theme.colors.status.healthy }}
                thumbColor="#FFF"
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={[styles.content, isWeb && { paddingLeft: 280 }]}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('dash')}>
                        <ChevronLeft color={Theme.colors.text.primary} size={28} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Ajustes y Sincronización</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
                    <Text style={styles.sectionHeader}>CONEXIÓN CON GOOGLE SHEETS</Text>
                    <View style={styles.sectionCard}>
                        <SettingToggle
                            icon={Database}
                            label="Sincronización con Google Sheets"
                            sublabel="finance.user@gmail.com"
                            enabled={isSyncEnabled}
                            onToggle={setIsSyncEnabled}
                        />
                        <View style={styles.separator} />
                        <SettingRow
                            icon={FileText}
                            label="Hoja de Cálculo Activa"
                            sublabel="Presupuesto_Anual_2024"
                        />
                        <View style={styles.separator} />
                        <SettingRow
                            icon={Clock}
                            label="Frecuencia de Sincronización"
                            sublabel="Cada 15 minutos"
                        />
                    </View>

                    <TouchableOpacity style={styles.syncNowButton}>
                        <RotateCcw size={20} color="#FFF" style={styles.syncBtnIcon} />
                        <Text style={styles.syncNowText}>Sincronizar Datos Ahora</Text>
                    </TouchableOpacity>
                    <Text style={styles.lastSyncText}>Última sincronización: hace 2 minutos</Text>

                    <Text style={styles.sectionHeader}>AJUSTES DE OCR (EXECUTORCH)</Text>
                    <View style={styles.sectionCard}>
                        <SettingToggle
                            icon={Maximize2}
                            label="Auto-escaneo de Recibos"
                            sublabel="Procesamiento en tiempo real"
                            enabled={isAutoScanEnabled}
                            onToggle={setIsAutoScanEnabled}
                        />
                        <View style={styles.separator} />
                        <SettingToggle
                            icon={Target}
                            label="Modo de Alta Precisión"
                            sublabel="Captura mejorada de datos"
                            enabled={isHighPrecisionEnabled}
                            onToggle={setIsHighPrecisionEnabled}
                        />
                        <View style={styles.separator} />
                        <SettingRow
                            icon={Cpu}
                            label="Motor del Modelo"
                            sublabel="ExecuTorch v1.4 (Optimizado)"
                        />
                    </View>

                    <Text style={styles.sectionHeader}>PREFERENCIAS GENERALES</Text>
                    <View style={styles.sectionCard}>
                        <SettingRow
                            icon={Coins}
                            label="Formato de Moneda"
                            sublabel="USD ($)"
                        />
                        <View style={styles.separator} />
                        <SettingRow
                            icon={Bell}
                            label="Notificaciones"
                            sublabel="Resumen diario habilitado"
                        />
                    </View>

                    <TouchableOpacity style={styles.resetButton}>
                        <Text style={styles.resetButtonText}>Restablecer Todos los Ajustes</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.versionText}>FINANCIAL TRACKER V2.4.1</Text>
                        <View style={styles.footerLinks}>
                            <Text style={styles.footerLink}>Privacy Policy</Text>
                            <View style={styles.footerDot} />
                            <Text style={styles.footerLink}>Terms of Service</Text>
                        </View>
                    </View>

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
    formScroll: {
        flex: 1,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '800',
        color: Theme.colors.text.muted,
        marginBottom: Theme.spacing.md,
        marginTop: Theme.spacing.xl,
        letterSpacing: 1.2,
    },
    sectionCard: {
        backgroundColor: Theme.colors.card,
        borderRadius: Theme.radius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Theme.spacing.md,
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.md,
    },
    settingInfo: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Theme.colors.text.primary,
    },
    settingSublabel: {
        fontSize: 13,
        color: Theme.colors.text.muted,
        marginTop: 2,
    },
    settingValue: {
        fontSize: 15,
        fontWeight: '600',
        color: Theme.colors.text.muted,
    },
    separator: {
        height: 1,
        backgroundColor: Theme.colors.border,
        marginLeft: 68,
    },
    syncNowButton: {
        backgroundColor: Theme.colors.brand.blue,
        borderRadius: Theme.radius.lg,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Theme.spacing.xl,
        marginBottom: Theme.spacing.sm,
        shadowColor: Theme.colors.brand.blue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    syncBtnIcon: {
        marginRight: 10,
    },
    syncNowText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    lastSyncText: {
        textAlign: 'center',
        fontSize: 12,
        color: Theme.colors.text.muted,
        fontStyle: 'italic',
    },
    resetButton: {
        backgroundColor: '#1A1A1A',
        borderRadius: Theme.radius.lg,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Theme.spacing.xxl,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Theme.colors.status.danger,
    },
    footer: {
        marginTop: Theme.spacing.xxl,
        alignItems: 'center',
        paddingBottom: 40,
    },
    versionText: {
        fontSize: 12,
        fontWeight: '800',
        color: Theme.colors.text.muted,
        letterSpacing: 1.5,
    },
    footerLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 12,
    },
    footerLink: {
        fontSize: 13,
        color: Theme.colors.text.muted,
    },
    footerDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Theme.colors.text.muted,
    }
});

export default Settings;
