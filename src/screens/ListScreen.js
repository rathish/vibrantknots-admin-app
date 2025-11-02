import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ListScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>List</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.dateSelector}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={20} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={styles.dateText}>April 2024</Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendar}>
        <View style={styles.weekHeader}>
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
            <Text key={day} style={styles.weekDay}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.calendarGrid}>
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 6;
            const isCurrentMonth = day > 0 && day <= 30;
            const isSelected = day === 9;
            
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDay
                ]}
              >
                <Text style={[
                  styles.dayText,
                  !isCurrentMonth && styles.inactiveDay,
                  isSelected && styles.selectedDayText
                ]}>
                  {isCurrentMonth ? day : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 20,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  calendar: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: '#8B5CF6',
  },
  dayText: {
    fontSize: 14,
    color: '#374151',
  },
  inactiveDay: {
    color: '#D1D5DB',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: '600',
  },
});
