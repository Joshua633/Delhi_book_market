// src/screens/buyer/ProfileScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen = ({ navigation }) => {
    const { user, signOut } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        address: '',
        phone_no: '',
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const { data, error } = await supabase
                .from('buyer_addresses')
                .select('*')
                .eq('buyer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAddresses(data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async () => {
        if (!formData.address || !formData.phone_no) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            const { error } = await supabase
                .from('buyer_addresses')
                .insert([
                    {
                        buyer_id: user.id,
                        address: formData.address,
                        phone_no: formData.phone_no,
                    },
                ]);

            if (error) throw error;

            Alert.alert('Success', 'Address added successfully');
            setFormData({ address: '', phone_no: '' });
            setShowAddForm(false);
            fetchAddresses();
        } catch (error) {
            console.error('Error adding address:', error);
            Alert.alert('Error', 'Failed to add address');
        }
    };

    const handleDeleteAddress = async (id) => {
        try {
            const { error } = await supabase
                .from('buyer_addresses')
                .delete()
                .eq('id', id);

            if (error) throw error;

            Alert.alert('Success', 'Address deleted successfully');
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            Alert.alert('Error', 'Failed to delete address');
        }
    };

    const renderAddressItem = ({ item }) => (
        <View style={styles.addressItem}>
            <View style={styles.addressInfo}>
                <Text style={styles.addressText}>{item.address}</Text>
                <Text style={styles.phoneText}>{item.phone_no}</Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteAddress(item.id)}
            >
                <Ionicons name="trash-outline" size={24} color={colors.danger} />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>User Information</Text>
                <Text style={styles.userInfo}>Name: {user?.name}</Text>
                <Text style={styles.userInfo}>Email: {user?.email}</Text>
                <Text style={styles.userInfo}>Role: {user?.role}</Text>
            </View>


            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Shipping Addresses</Text>
                    <TouchableOpacity
                        style={[styles.addButton, showAddForm && styles.cancelButton]}
                        onPress={() => setShowAddForm(!showAddForm)}
                    >
                        <Ionicons
                            name={showAddForm ? 'close-outline' : 'add-outline'}
                            size={20}
                            color={colors.white}
                        />
                        <Text style={styles.addButtonText}>
                            {showAddForm ? 'Cancel' : 'Add New'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {showAddForm && (
                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder="Address"
                            placeholderTextColor={colors.subtleText}
                            value={formData.address}
                            onChangeText={text => setFormData({ ...formData, address: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            placeholderTextColor={colors.subtleText}
                            value={formData.phone_no}
                            onChangeText={text => setFormData({ ...formData, phone_no: text })}
                            keyboardType="phone-pad"
                        />
                        <TouchableOpacity style={styles.saveButton} onPress={handleAddAddress}>
                            <Text style={styles.saveButtonText}>Save Address</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <FlatList
                    data={addresses}
                    renderItem={renderAddressItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No addresses found</Text>
                        </View>
                    }
                />
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

// ---
// ### Stylesheet

const colors = {
    primary: '#0E4A71',
    secondary: '#3A7CA5',
    background: '#F0F4F8',
    text: '#1C2C38',
    subtleText: '#667788',
    white: '#FFFFFF',
    border: '#DDE5EE',
    danger: '#DC3545',
    success: '#28A745',
};

const typography = {
    header: {
        fontSize: 28,
        fontWeight: '700',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
    },
    body: {
        fontSize: 14,
        fontWeight: '400',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
    },
    title: {
        ...typography.header,
        color: colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    card: {
        backgroundColor: colors.white,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    cardTitle: {
        ...typography.title,
        color: colors.text,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: 10,
    },
    userInfo: {
        ...typography.subtitle,
        color: colors.text,
        marginBottom: 5,
    },
    section: {
        marginTop: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        ...typography.title,
        color: colors.text,
    },
    addButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 12,
    },
    cancelButton: {
        backgroundColor: colors.danger,
    },
    addButtonText: {
        color: colors.white,
        fontSize: 14,
        marginLeft: 5,
        fontWeight: '600',
    },
    form: {
        marginBottom: 20,
    },
    input: {
        height: 50,
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 15,
        ...typography.body,
        color: colors.text,
        marginBottom: 15,
    },
    saveButton: {
        backgroundColor: colors.success,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: colors.white,
        ...typography.buttonText,
    },
    listContent: {
        paddingBottom: 20,
    },
    addressItem: {
        backgroundColor: colors.white,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addressInfo: {
        flex: 1,
        marginRight: 10,
    },
    addressText: {
        ...typography.subtitle,
        color: colors.text,
        marginBottom: 5,
    },
    phoneText: {
        ...typography.body,
        color: colors.subtleText,
    },
    deleteButton: {
        padding: 5,
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    emptyText: {
        ...typography.body,
        color: colors.subtleText,
        textAlign: 'center',
        marginTop: 10,
    },
    logoutButton: {
        backgroundColor: colors.danger,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    logoutButtonText: {
        color: colors.white,
        ...typography.buttonText,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});

export default ProfileScreen;