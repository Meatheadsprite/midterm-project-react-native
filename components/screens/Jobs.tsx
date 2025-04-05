import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, Modal, ActivityIndicator, Switch } from 'react-native';
import uuid from 'react-native-uuid';
import { Props } from '../navigation/props';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

interface Job {
  id: string;
  title: string;
  companyName: string;
  mainCategory: string;
  jobType: string;
  workModel: string;
  seniorityLevel: string;
}

const JobsScreen: React.FC<Props> = ({ navigation, toggleTheme, isDarkMode }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [whyHire, setWhyHire] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    contactNumber: '',
    whyHire: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const { colors } = useTheme();

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://empllo.com/api/v1');
      const data = await response.json();

      if (data && data.jobs) {
        const jobsWithIds: Job[] = data.jobs.map((job: Job) => ({
          ...job,
          id: uuid.v4(),
        }));

        setJobs(jobsWithIds);
        setFilteredJobs(jobsWithIds);
      } else {
        Alert.alert('Error', 'No jobs found in the response.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch jobs.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterJobs = (term: string) => {
    const filtered = jobs.filter((job) =>
      job.title.toLowerCase().includes(term.toLowerCase()) ||
      job.companyName.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredJobs(filtered);
  };

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    filterJobs(text);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSaveJob = (job: Job) => {
    setSavedJobs((prevSavedJobs) => {
      const jobIndex = prevSavedJobs.findIndex(savedJob => savedJob.id === job.id);
      if (jobIndex >= 0) {
        const updatedSavedJobs = [...prevSavedJobs];
        updatedSavedJobs.splice(jobIndex, 1);
        return updatedSavedJobs;
      } else {
        return [...prevSavedJobs, job];
      }
    });
  };

  const handleApplyPress = (job: Job) => {
    setSelectedJob(job);
    setModalVisible(true);
    setFeedbackMessage('');
  };

  const validateForm = (): boolean => {
    let formIsValid = true;
    let formErrors = { name: '', email: '', contactNumber: '', whyHire: '' };

    if (!name.trim()) {
      formErrors.name = 'Name is required.';
      formIsValid = false;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      formErrors.email = 'Email is required.';
      formIsValid = false;
    } else if (!emailPattern.test(email)) {
      formErrors.email = 'Please enter a valid email address.';
      formIsValid = false;
    }

    const contactNumberPattern = /^09\d{9}$/;
    if (!contactNumber.trim()) {
      formErrors.contactNumber = 'Contact number is required.';
      formIsValid = false;
    } else if (!contactNumberPattern.test(contactNumber)) {
      formErrors.contactNumber = 'Please enter a valid contact number (11 digits starting with 09).';
      formIsValid = false;
    }

    if (!whyHire.trim()) {
      formErrors.whyHire = 'This field is required.';
      formIsValid = false;
    }

    setErrors(formErrors);
    return formIsValid;
  };

  const handleSubmitApplication = () => {
    if (validateForm()) {
      setFeedbackMessage('Application submitted successfully!');
      setName('');
      setEmail('');
      setContactNumber('');
      setWhyHire('');
      setErrors({
        name: '',
        email: '',
        contactNumber: '',
        whyHire: '',
      });

      setTimeout(() => {
        setModalVisible(false);
      }, 2000);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setName('');
    setEmail('');
    setContactNumber('');
    setWhyHire('');
    setErrors({
      name: '',
      email: '',
      contactNumber: '',
      whyHire: '',
    });
    setFeedbackMessage('');
  };

  const renderJobItem = ({ item }: { item: Job }) => (
    <View style={[styles.jobContainer, { backgroundColor: colors.background }]}>
      <View style={styles.jobHeader}>
        <Text style={[styles.jobTitle, { color: colors.text }]}>{item.title}</Text>
        <TouchableOpacity onPress={() => handleSaveJob(item)}>
          <Icon 
            name={savedJobs.some(savedJob => savedJob.id === item.id) ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={
              savedJobs.some(savedJob => savedJob.id === item.id) 
                ? isDarkMode ? "#fff" : "#000" 
                : "#2e6f40"
            } 
          />
        </TouchableOpacity>
      </View>
      <Text style={[styles.jobCompany, { color: colors.text }]}>{item.companyName}</Text>
      <Text style={[styles.jobCategory, { color: colors.text }]}>Category: {item.mainCategory}</Text>
      <Text style={[styles.jobType, { color: colors.text }]}>Job Type: {item.jobType}</Text>
      <Text style={[styles.jobWorkModel, { color: colors.text }]}>Work Model: {item.workModel}</Text>
      <Text style={[styles.jobSeniority, { color: colors.text }]}>Seniority Level: {item.seniorityLevel}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleApplyPress(item)}
        >
          <Text style={styles.buttonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRightContainer}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => navigation.navigate('Saved Jobs', {
            savedJobs: savedJobs,
            setSavedJobs: setSavedJobs,
          })}
        >
          <Icon name="bookmark" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
          <Icon
            name="moon"
            size={20}
            color={colors.text}
            style={{ marginRight: 8 }}
          />
          <Switch
            value={isDarkMode} 
            onValueChange={toggleTheme} 
            trackColor={{ false: '#ddd', true: '#2e6f40' }} 
            thumbColor="#fff" 
          />
        </View>
      </View>

      <TextInput
        style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text }]}
        placeholder="Search by title or company..."
        placeholderTextColor={colors.placeholder}
        value={searchTerm}
        onChangeText={handleSearchChange}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#2e6f40" />
      ) : (
        <FlatList
          data={filteredJobs}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.id}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" onRequestClose={handleCloseModal}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          {selectedJob && (
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Apply for {selectedJob.title}</Text>
                <Text style={[styles.modalSubtitle, { color: colors.text }]}>at {selectedJob.companyName}</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.surface, 
                    color: colors.text,
                    borderColor: colors.placeholder
                  }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.placeholder}
                  value={name}
                  onChangeText={setName}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.surface, 
                    color: colors.text,
                    borderColor: colors.placeholder
                  }]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.surface, 
                    color: colors.text,
                    borderColor: colors.placeholder
                  }]}
                  placeholder="09XXXXXXXXX"
                  placeholderTextColor={colors.placeholder}
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  keyboardType="phone-pad"
                />
                {errors.contactNumber && <Text style={styles.errorText}>{errors.contactNumber}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Why should we hire you?</Text>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: colors.surface, 
                    color: colors.text,
                    borderColor: colors.placeholder
                  }]}
                  placeholder="Tell us why you're the best candidate..."
                  placeholderTextColor={colors.placeholder}
                  value={whyHire}
                  onChangeText={setWhyHire}
                  multiline
                  numberOfLines={4}
                />
                {errors.whyHire && <Text style={styles.errorText}>{errors.whyHire}</Text>}
              </View>

              {feedbackMessage && (
                <View style={styles.feedbackContainer}>
                  <Text style={styles.feedbackMessage}>{feedbackMessage}</Text>
                </View>
              )}

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.closeButton]} 
                  onPress={handleCloseModal}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]} 
                  onPress={handleSubmitApplication}
                >
                  <Text style={styles.buttonText}>Submit Application</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,  
    padding: 16,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  headerIcon: {
    marginLeft: 16,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 8,
    marginBottom: 16,
    borderColor: '#ddd',
    marginTop: 50,
  },
  jobContainer: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  jobCompany: {
    fontSize: 14,
    color: '#777',
  },
  jobCategory: {
    fontSize: 14,
    marginTop: 4,
  },
  jobType: {
    fontSize: 14,
    marginTop: 4,
  },
  jobWorkModel: {
    fontSize: 14,
    marginTop: 4,
  },
  jobSeniority: {
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  button: {
    backgroundColor: '#2e6f40',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: 120,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 10,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  feedbackContainer: {
    marginVertical: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e8f5e9',
  },
  feedbackMessage: {
    color: '#2e7d32',
    fontSize: 14,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: '#d32f2f',
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#2e6f40',
    marginLeft: 10,
  },
});

export default JobsScreen;