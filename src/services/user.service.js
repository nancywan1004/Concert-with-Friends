import { authHeader } from '../helpers/auth-header';
import { groupService } from './group.service';
import emailjs from 'emailjs-com';

export const userService = {
    login,
    logout,
    register,
    addGroup,
    updateProfile,
    getGroups,
    getUser,
    deleteGroup
};


emailjs.init("user_wBQ98U5brugzhi3uFKp08");

function login(username, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    };

    return fetch(`http://localhost:3001/login`, requestOptions)
        .then(handleResponse)
        .then(user => {
            console.log(user);
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(user));

            return user;
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

function register(user) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    return fetch(`http://localhost:3001/register`, requestOptions).then(handleResponse);
}

function addGroup(userId, eventId, _name, _email, _phone) {
    console.log("got here")
    const requestOptions = {
        method: 'PUT',
        headers: { /*...authHeader(),*/ 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: eventId })
    };

    const data = []
    groupService.getMembers(eventId).then(memberIds => {
        const array = [...memberIds]
        array.forEach(id => {
            userService.getUser(id).then(user => {
                data.push(user)
            })
        })
    })

    data.forEach(user => {
        var templateParams = {
            email: user.email,
            name: _name,
            contact1: _email,
            contact2: _phone
        };

        emailjs.send('service_spamsea', 'template_bxy4k56', templateParams)
            .then(function (response) {
                console.log('SUCCESS!', response.status, response.text);
            }, function (error) {
                console.log('FAILED...', error);
            });
    })

    var templateParams = {
        email: 'ruonanjia54@gmail.com',
        name: _name,
        contact1: _email,
        contact2: _phone
    };

    emailjs.send('service_spamsea', 'template_bxy4k56', templateParams)
        .then(function (response) {
            console.log('SUCCESS!', response.status, response.text);
        }, function (error) {
            console.log('FAILED...', error);
        });


    return fetch(`http://localhost:3001/users/${userId}`, requestOptions).then(response => response.json())
        .then((data) => {
            if (data.statusCode === (404 || 500 || 204)) {
                return Promise.reject(data.message);
            }
            localStorage.setItem('user', JSON.stringify(data));
            return Promise.resolve(data);
        });
}

function updateProfile(userId, newProfileData) {
    const requestOptions = {
        method: 'PUT',
        headers: { /*...authHeader(),*/ 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfileData)
    };

    return fetch(`http://localhost:3001/users/${userId}/edit-profile`, requestOptions).then(response => response.json())
        .then((data) => {
            if (data.statusCode === (404 || 500)) {
                return Promise.reject(data.message);
            }
            console.log(data);
            localStorage.setItem('user', JSON.stringify(data));
            return Promise.resolve(data);
        });
}

function getGroups(userId) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    return fetch(`http://localhost:3001/groups/${userId}`, requestOptions).then(handleResponse);
}

function getUser(userId) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    return fetch(`http://localhost:3001/users/${userId}`, requestOptions).then(handleResponse);
}

function deleteGroup(userId, eventId) {
    const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: eventId })
    };

    return fetch(`http://localhost:3001/users/${userId}`, requestOptions).then(response => response.json())
        .then((data) => {
            if (data.statusCode === (404 || 500)) {
                return Promise.reject(data.message);
            }
            localStorage.setItem('user', JSON.stringify(data));
            return Promise.resolve(data);
        });
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (response.status === 401 || data.statusCode === (204 || 500)) {
            // auto logout if 401 response returned from api
            logout();
            // location.reload(true);

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }
        return data;
    });
}