import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminTabBar } from '../../components/AdminTabBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AuthGuard } from '../../components/AuthGuard';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { MassageService } from '../../types';
import { formatNaira } from '../../mock/initialData';

export default function AdminServicesScreen() {
  const { services, saveService, toggleService } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Partial<MassageService> | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDuration, setFormDuration] = useState('60');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openAddModal = () => {
    setEditingService(null);
    setFormName('');
    setFormPrice('');
    setFormDuration('60');
    setFormTagline('');
    setFormDescription('');
    setFormBadge('');
    setModalVisible(true);
  };

  const openEditModal = (svc: MassageService) => {
    setEditingService(svc);
    setFormName(svc.name);
    setFormPrice(svc.price.toString());
    setFormDuration(svc.durationMinutes.toString());
    setFormTagline(svc.tagline || '');
    setFormDescription(svc.description || '');
    setFormBadge(svc.badge || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert('Required', 'Service name cannot be blank.');
      return;
    }
    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Enter a valid price in Naira (e.g. 25000).');
      return;
    }
    const durationNum = parseInt(formDuration, 10);
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('Invalid Duration', 'Enter session duration in minutes.');
      return;
    }

    setIsSaving(true);
    try {
      await saveService({
        id: editingService?.id,
        name: formName.trim(),
        price: priceNum,
        durationMinutes: durationNum,
        tagline: formTagline.trim(),
        description: formDescription.trim(),
        badge: formBadge.trim(),
        isActive: editingService?.isActive ?? true,
      });
      setModalVisible(false);
      Alert.alert('Saved', `${formName} has been ${editingService?.id ? 'updated' : 'added'} successfully.`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save service.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (svc: MassageService) => {
    const action = svc.isActive ? 'deactivate' : 'reactivate';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Service`,
      `${action.charAt(0).toUpperCase() + action.slice(1)} "${svc.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              await toggleService(svc.id);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update service status.');
            }
          },
        },
      ]
    );
  };

  return (
    <AuthGuard requiredRole="admin">
      <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Massage Services</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal} activeOpacity={0.8}>
          <Ionicons name="add" size={18} color={Colors.onPrimary} />
          <Text style={styles.addBtnText}>Add Service</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.pricingNote}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
          <Text style={styles.pricingNoteText}>
            All prices are displayed in Nigerian Naira (₦). Clients see the prices shown below.
          </Text>
        </View>

        {services.map((svc) => (
          <View key={svc.id} style={[styles.serviceCard, !svc.isActive && styles.serviceCardInactive]}>
            <View style={styles.serviceCardTop}>
              <View style={styles.serviceCardLeft}>
                <Text style={[styles.serviceName, !svc.isActive && styles.serviceNameInactive]}>
                  {svc.name}
                </Text>
                <Text style={styles.serviceTagline}>{svc.tagline}</Text>
              </View>
              <View style={styles.serviceCardRight}>
                <Text style={styles.servicePrice}>{formatNaira(svc.price)}</Text>
                <Text style={styles.serviceDuration}>{svc.durationMinutes} min</Text>
              </View>
            </View>

            {svc.badge ? (
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>{svc.badge}</Text>
              </View>
            ) : null}

            {svc.description ? (
              <Text style={styles.serviceDesc} numberOfLines={2}>{svc.description}</Text>
            ) : null}

            <View style={styles.serviceCardActions}>
              <View style={styles.toggleWrap}>
                <Switch
                  value={svc.isActive}
                  onValueChange={() => handleToggle(svc)}
                  trackColor={{ false: Colors.outlineVariant, true: Colors.primaryContainer }}
                  thumbColor={svc.isActive ? Colors.primary : Colors.mutedSlate}
                />
                <Text style={styles.toggleLabel}>{svc.isActive ? 'Active' : 'Inactive'}</Text>
              </View>

              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => openEditModal(svc)}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={15} color={Colors.primary} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingService?.id ? 'Edit Service' : 'Add New Service'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.charcoal} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Service Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="e.g. Swedish Massage"
                  placeholderTextColor={Colors.outline}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Price (₦) *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formPrice}
                    onChangeText={setFormPrice}
                    keyboardType="numeric"
                    placeholder="25000"
                    placeholderTextColor={Colors.outline}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Duration (minutes) *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formDuration}
                    onChangeText={setFormDuration}
                    keyboardType="numeric"
                    placeholder="60"
                    placeholderTextColor={Colors.outline}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Short Tagline</Text>
                <TextInput
                  style={styles.formInput}
                  value={formTagline}
                  onChangeText={setFormTagline}
                  placeholder="Brief session description"
                  placeholderTextColor={Colors.outline}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Description</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  value={formDescription}
                  onChangeText={setFormDescription}
                  placeholder="Detailed treatment description"
                  placeholderTextColor={Colors.outline}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Badge Label</Text>
                <TextInput
                  style={styles.formInput}
                  value={formBadge}
                  onChangeText={setFormBadge}
                  placeholder="e.g. Most Popular"
                  placeholderTextColor={Colors.outline}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>
                  {isSaving ? 'Saving…' : editingService?.id ? 'Update Service' : 'Add Service'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <AdminTabBar />
    </ScreenContainer>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineBorder,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.charcoal },
  addBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: { color: Colors.onPrimary, fontSize: 12, fontWeight: '700' },
  scrollView: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 90 },
  pricingNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.aquaMist,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.aquaTint,
  },
  pricingNoteText: { flex: 1, fontSize: 12, color: Colors.primary, lineHeight: 17 },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  serviceCardInactive: {
    opacity: 0.55,
    borderStyle: 'dashed',
  },
  serviceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  serviceCardLeft: { flex: 1, paddingRight: 8 },
  serviceCardRight: { alignItems: 'flex-end' },
  serviceName: { fontSize: 15, fontWeight: '700', color: Colors.charcoal },
  serviceNameInactive: { color: Colors.mutedSlate },
  serviceTagline: { fontSize: 11, color: Colors.mutedSlate, marginTop: 2 },
  servicePrice: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  serviceDuration: { fontSize: 11, color: Colors.mutedSlate },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.aquaMist,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  badgePillText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  serviceDesc: { fontSize: 12, color: Colors.mutedSlate, lineHeight: 17, marginBottom: 10 },
  serviceCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
    paddingTop: 10,
    marginTop: 2,
  },
  toggleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleLabel: { fontSize: 12, color: Colors.mutedSlate, fontWeight: '600' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.aquaMist,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.aquaTint,
  },
  editBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.charcoal },
  formGroup: { marginBottom: 14 },
  formRow: { flexDirection: 'row', gap: 10 },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  formInput: {
    backgroundColor: Colors.aquaMist,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.onSurface,
  },
  formTextArea: { height: 70, textAlignVertical: 'top', paddingTop: 10 },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: Colors.onPrimary, fontSize: 15, fontWeight: '700' },
});
