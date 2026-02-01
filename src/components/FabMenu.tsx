import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    TouchableWithoutFeedback,
    Dimensions,
    Platform
} from 'react-native';
import {
    Plus,
    X,
    TrendingUp,
    TrendingDown,
    PiggyBank
} from 'lucide-react-native';
import { Theme } from '../lib/theme';

interface FabMenuProps {
    onAction: (type: 'income' | 'expense' | 'saving') => void;
}

const FabMenu: React.FC<FabMenuProps> = ({ onAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    const toggleMenu = () => {
        const toValue = isOpen ? 0 : 1;
        Animated.spring(animation, {
            toValue,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
        setIsOpen(!isOpen);
    };

    const createItemStyle = (index: number) => {
        const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -70 * (index + 1)],
        });

        const opacity = animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
        });

        return {
            transform: [{ translateY }],
            opacity,
        };
    };

    const rotation = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    const MenuButton = ({ index, label, icon: Icon, color, type }: any) => (
        <Animated.View style={[styles.itemContainer, createItemStyle(index)]}>
            <View style={styles.labelContainer}>
                <Text style={styles.labelText}>{label}</Text>
            </View>
            <TouchableOpacity
                style={[styles.itemButton, { backgroundColor: color }]}
                onPress={() => {
                    onAction(type);
                    toggleMenu();
                }}
            >
                <Icon color="#FFF" size={24} />
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {isOpen && (
                <TouchableWithoutFeedback onPress={toggleMenu}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>
            )}

            <MenuButton
                index={2}
                label="Registrar Ahorro"
                icon={PiggyBank}
                color={Theme.colors.brand.blueLight}
                type="saving"
            />
            <MenuButton
                index={1}
                label="Agregar Gasto"
                icon={TrendingDown}
                color={Theme.colors.status.danger}
                type="expense"
            />
            <MenuButton
                index={0}
                label="Agregar Ingreso"
                icon={TrendingUp}
                color={Theme.colors.status.healthy}
                type="income"
            />

            <TouchableOpacity
                style={[styles.mainButton, isOpen && styles.mainButtonActive]}
                activeOpacity={0.8}
                onPress={toggleMenu}
            >
                <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                    <Plus color="#FFF" size={32} />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: Platform.OS === 'web' ? 32 : 100,
        right: 24,
        alignItems: 'center',
        zIndex: 1000,
    },
    overlay: {
        position: 'absolute',
        bottom: -100,
        right: -100,
        width: Dimensions.get('window').width * 2,
        height: Dimensions.get('window').height * 2,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    mainButton: {
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
    mainButtonActive: {
        backgroundColor: '#374151',
    },
    itemContainer: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        right: 0,
        width: 200,
        justifyContent: 'flex-end',
    },
    labelContainer: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        marginRight: 16,
    },
    labelText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    itemButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
});

export default FabMenu;
