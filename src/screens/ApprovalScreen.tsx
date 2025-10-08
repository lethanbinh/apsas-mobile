import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AppSafeView from '../components/views/AppSafeView';
import ScreenHeader from '../components/common/ScreenHeader';
import { AppColors } from '../styles/color';
import { s } from 'react-native-size-matters';
import { DownloadIcon } from '../assets/icons/courses';

type Assignment = {
  id: string;
  title: string;
  semester: string;
  name: string;
  files: { id: string; title: string; fileName: string }[];
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
};

const initialData: Assignment[] = [
  {
    id: '1',
    title: 'SE1720 - Summer2025',
    semester: '9',
    name: 'Assignment1 - Nguyen NT',
    files: [
      { id: 'f1', title: 'Requirement', fileName: 'requirement.pdf' },
      { id: 'f2', title: 'Criteria', fileName: 'criteria.pdf' },
    ],
    status: 'Pending',
  },
  {
    id: '2',
    title: 'SE1720 - Summer2025',
    semester: '9',
    name: 'Assignment2 - Tran VH',
    files: [{ id: 'f3', title: 'Requirement', fileName: 'req2.pdf' }],
    status: 'Pending',
  },
  {
    id: '3',
    title: 'SE1720 - Fall2025',
    semester: '10',
    name: 'Assignment3 - Le TT',
    files: [{ id: 'f4', title: 'Requirement', fileName: 'req3.pdf' }],
    status: 'Pending',
  },
];

const ApprovalScreen = () => {
  const [data, setData] = useState(initialData);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>(
    {},
  );

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleApprove = (id: string) => {
    setData(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'Approved' } : item,
      ),
    );
  };

  const handleReject = (id: string) => {
    if (!rejectReason[id]) return; // phải nhập lý do
    setData(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: 'Rejected', reason: rejectReason[id] }
          : item,
      ),
    );
  };

  const renderStatus = (status: string) => {
    let bg = '#FFD700';
    if (status === 'Approved') bg = '#A5F3B7';
    if (status === 'Rejected') bg = '#FCA5A5';
    return (
      <View style={[styles.statusBox, { backgroundColor: bg }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  };

  return (
    <AppSafeView>
      <ScreenHeader title="Approval" />
      <View style={styles.container}>
        {data.map(item => (
          <View key={item.id} style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => toggleExpand(item.id)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              {renderStatus(item.status)}
              <Text style={styles.expandIcon}>
                {expanded === item.id ? '-' : '+'}
              </Text>
            </TouchableOpacity>

            {expanded === item.id && (
              <View style={styles.cardBody}>
                <Text style={styles.label}>Semester</Text>
                <TextInput
                  style={styles.input}
                  editable={false}
                  value={item.semester}
                />
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  editable={false}
                  value={item.name}
                />

                {item.files.map((f, index) => (
                  <View key={f.id} style={styles.fileRow}>
                    <Text style={styles.fileIndex}>
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileTitle}>{f.title}</Text>
                      <Text style={styles.fileName}>{f.fileName}</Text>
                    </View>
                    <DownloadIcon />
                  </View>
                ))}

                {item.status === 'Pending' && (
                  <>
                    {rejectReason[item.id] !== undefined && (
                      <TextInput
                        style={styles.reasonInput}
                        placeholder="Enter reject reason..."
                        value={rejectReason[item.id]}
                        onChangeText={txt =>
                          setRejectReason(prev => ({ ...prev, [item.id]: txt }))
                        }
                      />
                    )}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.btn, { backgroundColor: '#3B82F6' }]}
                        onPress={() => handleApprove(item.id)}
                      >
                        <Text style={styles.btnText}>Approve</Text>
                      </TouchableOpacity>
                      {rejectReason[item.id] === undefined ? (
                        <TouchableOpacity
                          style={[styles.btn, { backgroundColor: '#F87171' }]}
                          onPress={() =>
                            setRejectReason(prev => ({
                              ...prev,
                              [item.id]: '',
                            }))
                          }
                        >
                          <Text style={styles.btnText}>Reject</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.btn, { backgroundColor: '#DC2626' }]}
                          onPress={() => handleReject(item.id)}
                        >
                          <Text style={styles.btnText}>Confirm Reject</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}

                {item.status === 'Rejected' && (
                  <Text style={styles.reasonText}>Reason: {item.reason}</Text>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    </AppSafeView>
  );
};

export default ApprovalScreen;

const styles = StyleSheet.create({
  container: { padding: s(20) },
  card: {
    backgroundColor: AppColors.pr100,
    borderRadius: s(10),
    marginBottom: 12,
    padding: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: { flex: 1, fontWeight: 'bold', fontSize: 16 },
  expandIcon: { fontSize: 18, marginLeft: 8 },
  statusBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  cardBody: { marginTop: 10 },
  label: { fontSize: 14, fontWeight: '500', marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 6,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
  },
  fileIndex: { fontWeight: 'bold', marginRight: 10 },
  fileInfo: { flex: 1 },
  fileTitle: { fontWeight: 'bold' },
  fileName: { color: '#6B7280' },
  downloadIcon: { fontSize: 18, color: '#3B82F6' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  btn: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: 6,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  reasonText: {
    marginTop: 8,
    color: '#DC2626',
    fontStyle: 'italic',
  },
});
