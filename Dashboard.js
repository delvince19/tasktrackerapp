    import React, { useEffect, useState, useCallback } from 'react';
    import { View, Text, Image, Button, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
    import AsyncStorage from '@react-native-async-storage/async-storage';
    import axios from 'axios';
    import { useFocusEffect, useNavigation } from '@react-navigation/native';

    const API_URL = 'http://192.168.137.1:8081';

    const Dashboard = () => {
        const [user, setUser] = useState({});
        const [tasks, setTasks] = useState([]);
        const [dropdownVisible, setDropdownVisible] = useState(false);
        const navigation = useNavigation();

        useFocusEffect(
            useCallback(() => {
            const fetchTasks = async () => {
                try {
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const { student_id } = JSON.parse(userData);
                    const response = await axios.get(`${API_URL}/tasklist?student_id=${student_id}`);
                    setTasks(response.data);
                } else {
                    navigation.navigate('Login');
                }
                } catch (error) {
                console.error('Failed to fetch tasks:', error);
                }
            };

            fetchTasks();
        }, [])
    );

    useEffect(() => {
        const getUserData = async () => {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const parsedUserData = JSON.parse(userData);
                setUser(parsedUserData);

                // Fetch tasks only after setting the user
                fetchTasks(parsedUserData.student_id);
            } else {
                navigation.navigate('Login');
            }
        };

            getUserData();
            fetchTasks();
        }, []);

        const fetchTasks = async (student_id) => {
            try {
                const response = await axios.get(`${API_URL}/tasklist?student_id=${student_id}`);
                setTasks(response.data);
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
            }
        };        

        const handleLogout = async () => {
            await AsyncStorage.removeItem('userData');
            navigation.navigate('Login');
        };
        
        const markAsDone = async (taskId, isChecked) => {
            try {
                console.log("Task ID:", taskId);
                console.log("isChecked:", isChecked);
                await axios.patch(`${API_URL}/update_task/${taskId}`, {
                    mark_as_done: isChecked ? 1 : 0
                });
        
                // Update the status of the specific task locally in the state
                const updatedTasks = tasks.map(task => {
                    if (task.id === taskId) {
                        return { ...task, mark_as_done: isChecked };
                    }
                    return task;
                });
                setTasks(updatedTasks);
            } catch (error) {
                console.error('Failed to update task status:', error);
            }
        };
        
        const handleDeleteTask = async (taskId) => {
            try {
                await axios.post(`${API_URL}/delete_task`, { id: taskId });
                // After deleting task, fetch updated tasks
                fetchTasks();
            } catch (error) {
                console.error('Failed to delete task:', error);
            }
        };    

        const generateUserName = () => {
            if (user.middlename && user.middlename.length > 0) {
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
                    <Image
                        source={{ uri: user.profile_picture }}
                        style={styles.profileImage}
                    />
                    <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)} style={styles.profileContainer}>
                        {dropdownVisible && (
                            <View style={styles.dropdown}>
                                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                                    <Text style={styles.dropdownText}>Profile</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleLogout}>
                                    <Text style={styles.dropdownText}>Logout</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                <Button title="Add Task" onPress={() => navigation.navigate('AddTask')} />
                <FlatList
                    data={tasks}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.taskContainer}>
                            <Text style={styles.taskTitle}>{item.task_name}</Text>
                            <Text style={styles.taskDescription}>{item.task_course}</Text>
                            <Text style={styles.taskPriority}>Priority: {item.priority}</Text>
                            <Text style={styles.taskDeadline}>Deadline: {item.deadline}</Text>
                            <View style={styles.taskActions}>
                                <TouchableOpacity onPress={() => markAsDone(item.id, !item.mark_as_done)}>
                                    <Text>{item.mark_as_done ? 'Unmark as done' : 'Mark as done'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate('UpdateTask', { taskId: item.id })}>
                                    <Text>Update</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
                                    <Text>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>
        );
    };


    const styles = StyleSheet.create({
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
            padding: 16,
            backgroundColor: '#fff'
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold'
        },
        profileContainer: {
            position: 'relative'
        },
        profileImage: {
            width: 60,
            height: 60,
            borderRadius: 30
        },
        dropdown: {
            position: 'absolute',
            top: 70,
            right: 0,
            backgroundColor: '#fff',
            borderRadius: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
            zIndex: 1000
        },
        dropdownText: {
            padding: 10,
            fontSize: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#ccc'
        },
        taskContainer: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#ccc'
        },
        taskTitle: {
            fontSize: 18,
            fontWeight: 'bold'
        },
        taskDescription: {
            fontSize: 16,
            marginVertical: 8
        },
        taskPriority: {
            fontSize: 14,
            color: '#888'
        },
        taskDeadline: {
            fontSize: 14,
            color: '#888'
        },
        taskActions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8
        }
    });

    export default Dashboard;
