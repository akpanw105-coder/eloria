import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { MassageService } from '../../types';

export default function AdminServicesScreen() {
  const { services, saveService, toggleService } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<MassageService | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [price, setPrice] = useState('95');
  const [badge, setBadge] = useState('Therapeutic');

  const openAddModal = () => {
    setEditingService(null);
    setName('');
    setTagline('');
    setDescription('');
    setDurationMinutes('60');
    setPrice('95');
    setBadge('Therapeutic • Relaxing');
    setModalVisible(true);
  };

  const openEditModal = (service: MassageService) => {
    setEditingService(service);
    setName(service.name);
    setTagline(service.tagline);
    setDescription(service.description);
    setDurationMinutes(service.durationMinutes.toString());
    setPrice(service.price.toString());
    setBadge(service.badge);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a treatment name.');
      return;
    }
    await saveService({
      ...(editingService ? { id: editingService.id } : {}),
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      durationMinutes: parseInt(durationMinutes, 10) || 60,
      price: parseFloat(price) || 85,
      badge: badge.trim(),
      isActive: editingService ? editingService.isActive : true,
    });
    setModalVisible(false);
  };

  return (
    <ScreenContainer>
      <AppHeader title="Service Management" subtitle="Catalog" showBack onBack={() => {}} />

      <View style={styles.topActionRow}>
        <Text style={styles.catalogHeading}>Therapies & Pricing ({services.length})</Text>
        <TouchableOpacity style={styles.addServiceBtn} onPress={openAddModal}>
          <Ionicons name="add" size={16} color={Colors.onPrimary} />
          <Text style={styles.addServiceBtnText}>New Service</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {services.map((item) => (
          <View key={item.id} style={styles.serviceRowCard}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="sparkles" size={18} color={Colors.primaryContainer} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceName}>{item.name}</Text>
                  <Text style={styles.serviceBadge}>{item.badge}</Text>
                </View>
              </View>

              <Switch
                value={item.isActive}
                onValueChange={() => toggleService(item.id)}
                trackColor={{ false: Colors.surfaceContainer, true: Colors.primaryContainer }}
              />
            </View>

            <Text style={styles.serviceDesc} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.metaRow}>
                <Text style={styles.metaDuration}>{item.durationMinutes} Minutes</Text>
                <Text style={styles.metaPrice}>${item.price}.00</Text>
                <Text
                  style={[
                    styles.activeStateText,
                    item.isActive ? { color: Colors.success } : { color: Colors.mutedSlate },
                  ]}
                >
                  {item.isActive ? 'Active in Booking' : 'Hidden from Catalog'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => openEditModal(item)}
              >
                <Ionicons name="create-outline" size={14} color={Colors.primary} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit / Create Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingService ? 'Edit Treatment' : 'Add New Massage Therapy'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>TREATMENT NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Deep Tissue Myofascial Release"
                  placeholderTextColor={Colors.tertiary}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>TAGLINE / SUMMARY</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 75 min deep tension release"
                  placeholderTextColor={Colors.tertiary}
                  value={tagline}
                  onChangeText={setTagline}
                />
              </View>

              <View style={styles.rowTwoInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>DURATION (MIN)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="60"
                    placeholderTextColor={Colors.tertiary}
                    keyboardType="numeric"
                    value={durationMinutes}
                    onChangeText={setDurationMinutes}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>PRICE ($ USD)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="95"
                    placeholderTextColor={Colors.tertiary}
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>BADGE TAG</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Most Popular • Restorative"
                  placeholderTextColor={Colors.tertiary}
                  value={badge}
                  onChangeText={setBadge}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FULL CLINICAL DESCRIPTION</Text>
                <TextInput
                  style={[styles.input, { height: 70, textAlignVertical: 'top', paddingTop: 8 }]}
                  multiline
                  placeholder="Description of the modality, techniques and physiological benefits..."
                  placeholderTextColor={Colors.tertiary}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <TouchableOpacity style={styles.saveSubmitBtn} onPress={handleSave}>
                <Text style={styles.saveSubmitBtnText}>
                  {editingService ? 'Save Changes' : 'Create Treatment'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <AdminTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  catalogHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  addServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addServiceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  serviceRowCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  serviceBadge: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 1,
  },
  serviceDesc: {
    fontSize: 12,
    color: Colors.tertiary,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaDuration: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.tertiary,
  },
  metaPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  activeStateText: {
    fontSize: 10,
    fontWeight: '600',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 29, 31, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  formContent: {
    gap: 12,
    paddingBottom: 20,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.tertiary,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  rowTwoInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  saveSubmitBtn: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveSubmitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
});
