// Register a new user
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            username: username,
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error('Error:', error));
});

// Get user information
document.getElementById('getUserForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('getEmail').value;
    const password = document.getElementById('getPassword').value;

    fetch('/get-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.username) {
            document.getElementById('userInfo').innerHTML = `
                <p><strong>Username:</strong> ${data.username}</p>
                <p><strong>Email:</strong> ${data.email}</p>
            `;
        } else {
            document.getElementById('userInfo').innerHTML = `<p>${data.message}</p>`;
        }
    })
    .catch(error => console.error('Error:', error));
});

// Update user information
document.getElementById('updateUserForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('updateEmail').value;
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const username = document.getElementById('updateUsername').value;

    fetch('/update-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            email: email,
            oldPassword: oldPassword,
            newPassword: newPassword,
            username: username
        })
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error('Error:', error));
});

// Delete a user
document.getElementById('deleteUserForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('deleteEmail').value;
    const password = document.getElementById('deletePassword').value;

    fetch('/delete-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
        } else {
            alert('An unknown error occurred');
        }
    })
    .catch(error => console.error('Error:', error));
});
