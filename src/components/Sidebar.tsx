import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import {
    LayoutGrid,
    Wallet,
    BarChart3,
    Settings as SettingsIcon,
    LogOut,
    ChevronRight
} from 'lucide-react-native';
import { Theme } from '../lib/theme';

interface SidebarProps {
    onNavigate: (screen: 'dash' | 'budget' | 'history' | 'stats') => void;
    currentScreen: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentScreen }) => {
    const NavItem = ({ icon: Icon, label, screen, active = false }: any) => (
        <TouchableOpacity
            style={[styles.navItem, active && styles.navItemActive]}
            activeOpacity={0.7}
            onPress={() => onNavigate(screen)}
        >
            <View style={styles.navItemLeft}>
                <Icon size={22} color={active ? Theme.colors.brand.blueLight : Theme.colors.text.muted} />
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
            </View>
            {active && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.logoSection}>
                <View style={styles.logoIcon}>
                    <Wallet color={Theme.colors.brand.blueLight} size={24} />
                </View>
                <Text style={styles.logoText}>Nel</Text>
            </View>

            <View style={styles.navSection}>
                <Text style={styles.sectionLabel}>MENÚ</Text>
                <NavItem icon={LayoutGrid} label="Tablero" screen="dash" active={currentScreen === 'dash'} />
                <NavItem icon={Wallet} label="Presupuesto" screen="budget" active={currentScreen === 'budget'} />
                <NavItem icon={BarChart3} label="Historial" screen="history" active={currentScreen === 'history'} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 280,
        backgroundColor: '#0A0A0A',
        borderRightWidth: 1,
        borderRightColor: Theme.colors.border,
        paddingVertical: Theme.spacing.xl,
        paddingHorizontal: Theme.spacing.lg,
        zIndex: 100,
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Theme.spacing.md,
        marginBottom: Theme.spacing.xxl,
        paddingHorizontal: Theme.spacing.sm,
    },
    logoIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Theme.colors.transparent.blue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 20,
        fontWeight: '900',
        color: Theme.colors.text.primary,
        letterSpacing: -0.5,
    },
    navSection: {
        flex: 1,
        gap: 4,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: Theme.colors.text.muted,
        marginBottom: Theme.spacing.md,
        paddingHorizontal: Theme.spacing.sm,
        letterSpacing: 1,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: Theme.spacing.sm,
        borderRadius: Theme.radius.md,
    },
    navItemActive: {
        backgroundColor: Theme.colors.transparent.white,
    },
    navItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Theme.spacing.md,
    },
    navLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: Theme.colors.text.muted,
    },
    navLabelActive: {
        color: Theme.colors.text.primary,
    },
    activeIndicator: {
        width: 4,
        height: 16,
        borderRadius: 2,
        backgroundColor: Theme.colors.brand.blueLight,
    },
    userSection: {
        marginTop: 'auto',
        paddingTop: Theme.spacing.xl,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.card,
        padding: Theme.spacing.md,
        borderRadius: Theme.radius.lg,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: '700',
        color: Theme.colors.text.primary,
    },
    userEmail: {
        fontSize: 12,
        color: Theme.colors.text.muted,
    },
});

export default Sidebar;
