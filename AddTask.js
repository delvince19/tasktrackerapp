import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import axios from 'axios';

const API_URL = 'http://192.168.137.1:8081';

const AddTask = () => {
    const [taskName, setTaskName] = useState('');
    const [taskCourse, setTaskCourse] = useState('');
    const [priority, setPriority] = useState('medium');
    const [deadline, setDeadline] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState({});
    const navigation = useNavigation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const { student_id, firstname, middlename, lastname } = JSON.parse(userData);
                    setUserId(student_id);
                    setUser({ firstname, middlename, lastname }); // Set user data
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchData();
    }, []);

    const fetchUserId = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const { student_id } = JSON.parse(userData);
                setUserId(student_id);
            }
        } catch (error) {
            console.error('Error fetching user ID:', error);
        }
    };

    // Call fetchUserId when component mounts
    useEffect(() => {
        fetchUserId();
    }, []);

    const priorities = [
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' },
    ];

    const handleSelectPriority = (value) => {
        setPriority(value);
        setShowDropdown(false);
    };

    const handleSubmit = async () => {
        if (!taskName || !taskCourse || !priority || !deadline || !userId) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            await axios.post(`${API_URL}/add_task`, {
                student_id: userId, // Use the retrieved userId
                task_name: taskName,
                task_course: taskCourse,
                priority: priority,
                deadline: deadline,
            });
            Alert.alert('Success', 'Task added successfully');
            navigation.navigate('Dashboard');
        } catch (error) {
            console.error('Failed to add task:', error);
            Alert.alert('Error', 'Failed to add task');
        }
    };

        const handleBack = () => {
            navigation.navigate('Dashboard');
        };

        const generateUserName = () => {
            if (user.middlename) {
                return `${user.firstname} ${user.middlename.charAt(0)}. ${user.lastname}`;
            }
            return `${user.firstname} ${user.lastname}`;
        };

        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Task Tracker</Text>
                    <View style={styles.userNameContainer}>
                        <Text style={styles.userName}>
                            {generateUserName()}
                        </Text>
                    </View>
                </View>
            <View style={styles.form}>
                <Text style={styles.label}>Task Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Task Name"
                    value={taskName}
                    onChangeText={setTaskName}
                />
                <Text style={styles.label}>Course</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Course"
                    value={taskCourse}
                    onChangeText={setTaskCourse}
            />
            <View style={styles.priorityContainer}>
                <Text style={styles.label}>Priority Level</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowDropdown(true)}>
                    <Text>{priority}</Text>
                </TouchableOpacity>
                <Modal
                    visible={showDropdown}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowDropdown(false)}
            >
            <View style={styles.modalContainer}>
                <FlatList
                    data={priorities}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSelectPriority(item.value)}>
                            <Text style={styles.dropdownItem}>{item.label}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.value}
                />
            </View>
        </Modal>
    </View>
    <Text style={styles.label}>Deadline</Text>
    <TextInput
        style={styles.input}
        placeholder="Input Deadline"
        value={deadline}
        onChangeText={setDeadline}
        type="date"
    />
    <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonBack} onPress={handleBack}>
            <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSubmit} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
    </View>
</View>
</View>
        );
    };

    const styles = StyleSheet.create({
        title: {
            fontSize: 24,
            fontWeight: 'bold'
        },
        userNameContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        userName: {
            fontSize: 18,
            fontWeight: 'bold',
            marginLeft: 10,
        },
        container: {
            flex: 1,
            backgroundColor: '#fff',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#ccc',
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            flex: 1,
            textAlign: 'center',
        },
        form: {
            padding: 16,
        },
        label: {
            fontSize: 16,
            marginBottom: 8,
        },
        input: {
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 8,
            marginBottom: 16,
            borderRadius: 4,
        },
        priorityContainer: {
            marginBottom: 16,
        },
        dropdownButton: {
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 8,
            marginBottom: 8,
            borderRadius: 4,
            alignItems: 'center',
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
            marginTop: 20,
            marginRight: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 4,
        },
        dropdownItem: {
            padding: 10,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        buttonBack: {
            backgroundColor: '#dc3545',
            padding: 12,
            borderRadius: 4,
        },
        buttonSubmit: {
            backgroundColor: '#007bff',
            padding: 12,
            borderRadius: 4,
        },
        buttonText: {
            color: '#fff',
            textAlign: 'center',
        },
    });

    export default AddTask;
