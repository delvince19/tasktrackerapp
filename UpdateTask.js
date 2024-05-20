import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.137.1:8081';

const UpdateTask = ({ route, navigation }) => {
    const { taskId } = route.params;

    const [task, setTask] = useState({
        id: '',
        task_name: '',
        task_course: '',
        priority: '',
        deadline: '',
    });
    const [user, setUser] = useState({}); // New state to store user data

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_URL}/tbl_tasklist/${taskId}`);
                setTask(response.data[0]);
            } catch (error) {
                console.error('Failed to fetch task:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const { firstname, middlename, lastname } = JSON.parse(userData);
                    setUser({ firstname, middlename, lastname }); // Set user data
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

  const fetchTask = async () => {
    try {
      const response = await axios.get(`${API_URL}/tbl_tasklist/${taskId}`);
      setTask(response.data[0]);
    } catch (error) {
      console.error('Failed to fetch task:', error);
    }
  };

  const updateTask = async () => {
    try {
      await axios.put(`${API_URL}/update_task/${task.id}`, task, {
        headers: { 'Content-Type': 'application/json' }
      });
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Failed to update task:', error);
    }
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
      <Text style={styles.title}>Update Task Details</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={task.task_name}
          onChangeText={(text) => setTask({ ...task, task_name: text })}
          placeholder="Task Name"
        />
        <TextInput
          style={styles.input}
          value={task.task_course}
          onChangeText={(text) => setTask({ ...task, task_course: text })}
          placeholder="Course"
        />
        <TextInput
          style={styles.input}
          value={task.priority}
          onChangeText={(text) => setTask({ ...task, priority: text })}
          placeholder="Priority Level"
        />
        <TextInput
          style={styles.input}
          value={task.deadline}
          onChangeText={(text) => setTask({ ...task, deadline: text })}
          placeholder="Deadline"
        />
        <TouchableOpacity style={styles.button} onPress={updateTask}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  form: {
    width: '80%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UpdateTask;
