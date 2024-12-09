const chatPage = document.getElementById('chatPage');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const connectButton = document.getElementById('connectButton');
const exitButton = document.getElementById('exitButton');
const serverAddress = document.getElementById('serverAddress');
const serverPort = document.getElementById('serverPort');
const authKey = document.getElementById('authKey');
const serverList = document.getElementById('serverList');
const toggleSidebarButton = document.getElementById('toggleSidebarButton');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const closeSidebarButton = document.getElementById('closeSidebarButton');
const delServerButton  = document.getElementById('delServerButton');
const showServerFormButton = document.getElementById('showServerFormButton');
const serverForm = document.getElementById('serverForm');

// Function to add messages to the chat
function addMessage(sender, content) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  const isUser = sender === 'You';
  const messageClass = isUser ? 'message-right' : '';
  messageElement.classList.add(messageClass);

  messageElement.innerHTML = `
    <img src="https://via.placeholder.com/30" alt="avatar" />
    <p>${content}</p>
  `;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Event listeners
sendButton.addEventListener('click', () => {
  const message = { type: 'message', content: messageInput.value };
  window.electronAPI.sendMessage(message);
  addMessage('You', messageInput.value);
  messageInput.value = '';
});

connectButton.addEventListener('click', () => {
  const address = serverAddress.value;
  const port = serverPort.value;
  const key = authKey.value;
  window.electronAPI.connectToServer(address, port, key);
});

// Handle connection status
window.electronAPI.onConnectionStatus(({ status }) => {
  if (status === 'connected') {
    showChatPage();
    sendButton.disabled = false; // Enable Send button after connection
  } else {
    sendButton.disabled = true; // Keep Send button disabled if not connected
    alert("错误！请检查服务器是否存在或秘钥是否正确"); // Show error message
  }
});

// Handle receiving messages
window.electronAPI.onReceiveMessage((message) => {
  addMessage('Server', message);
});

// Show Chat Page (default visible)
function showChatPage() {
  chatPage.style.display = 'block';
}

// Fetch and display saved servers
function fetchServers() {
  window.electronAPI.getServers(); // Request the list of saved servers
}

// Display saved servers
window.electronAPI.onServerList((servers) => {
  serverList.innerHTML = ''; // Clear existing list
  servers.forEach(server => {
    const listItem = document.createElement('li');
    listItem.textContent = `${server.address}:${server.port}`;
    listItem.addEventListener('click', () => {
      // Set the input fields with the selected server's details
      serverAddress.value = server.address;
      serverPort.value = server.port;
      authKey.value = server.authKey;

      // Connect to the selected server
      window.electronAPI.connectToServer(server.address, server.port, server.authKey);

      // Hide the sidebar and form after selection
      sidebar.style.left = '-250px'; 
      overlay.style.display = 'none'; // Hide the overlay
      serverForm.style.display = 'none'; // Hide the form when sidebar is closed
      closeSidebarButton.style.display = 'none';
    });
    serverList.appendChild(listItem);
  });
});

// Toggle sidebar visibility
toggleSidebarButton.addEventListener('click', () => {
  if (sidebar.style.left === '0px') {
    // If sidebar is visible, hide it and the form
    sidebar.style.left = '-250px'; 
    overlay.style.display = 'none'; // Hide the overlay
    serverForm.style.display = 'none'; // Hide the form
    closeSidebarButton.style.display = 'none';
  } else {
    // If sidebar is hidden, show it
    sidebar.style.left = '0px'; 
    overlay.style.display = 'block'; // Show overlay
    closeSidebarButton.style.display = 'block';
  }
});

// Close sidebar when clicking on close button
closeSidebarButton.addEventListener('click', () => {
  sidebar.style.left = '-250px'; // Hide sidebar
  overlay.style.display = 'none'; // Hide overlay
  serverForm.style.display = 'none'; // Hide the form
  closeSidebarButton.style.display = 'none';
});

// Close sidebar when clicking on the overlay
overlay.addEventListener('click', () => {
  sidebar.style.left = '-250px'; // Hide sidebar
  overlay.style.display = 'none'; // Hide overlay
  serverForm.style.display = 'none'; // Hide the form
  closeSidebarButton.style.display = 'none';
});


// Show the server form when clicking on the "+" button in the sidebar
showServerFormButton.addEventListener('click', () => {
  serverForm.style.display = serverForm.style.display === 'none' ? 'block' : 'none'; // Toggle form visibility
});

// Assuming there's a link button to trigger the action
const linkButton = document.getElementById('connectButton'); // Your link button ID

linkButton.addEventListener('click', () => {
  // Hide the sidebar
  sidebar.style.left = '-250px'; // You can use a different approach depending on your sidebar behavior

  // Hide the overlay
  overlay.style.display = 'none';

  // Hide the server form
  serverForm.style.display = 'none';

  // Show the chat page
  showChatPage();
});

delServerButton.addEventListener('click', () => {

  //弹出一个窗口 选择要删除的服务器 服务列表器列表从server.json里面读 删也是在这里删 不知道你有没有存在内存里面 内存里有也删
  //按照注释补全


  //

});


// Function to show chat page
function showChatPage() {
  serverPage.style.display = 'none'; // Hide the server form
  chatPage.style.display = 'block'; // Show the chat page
}

// Local storage key for servers
const SERVERS_KEY = 'servers';

// Load servers from localStorage
function loadServers() {
  const servers = localStorage.getItem(SERVERS_KEY);
  return servers ? JSON.parse(servers) : [];
}

// Save servers to localStorage
function saveServers(servers) {
  localStorage.setItem(SERVERS_KEY, JSON.stringify(servers));
}

// Render servers list to the page
function renderServerList() {
  const serverList = document.getElementById('serverList');
  serverList.innerHTML = ''; // Clear current list

  const servers = loadServers();

  servers.forEach((server, index) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <span>${server.address}:${server.port}</span>
      <button class="tooltip" data-index="${index}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" height="25" width="25">
          <path fill="#6361D9" d="M8.78842 5.03866C8.86656 4.96052 8.97254 4.91663 9.08305 4.91663H11.4164C11.5269 4.91663 11.6329 4.96052 11.711 5.03866C11.7892 5.11681 11.833 5.22279 11.833 5.33329V5.74939H8.66638V5.33329C8.66638 5.22279 8.71028 5.11681 8.78842 5.03866ZM7.16638 5.74939V5.33329C7.16638 4.82496 7.36832 4.33745 7.72776 3.978C8.08721 3.61856 8.57472 3.41663 9.08305 3.41663H11.4164C11.9247 3.41663 12.4122 3.61856 12.7717 3.978C13.1311 4.33745 13.333 4.82496 13.333 5.33329V5.74939H15.5C15.9142 5.74939 16.25 6.08518 16.25 6.49939C16.25 6.9136 15.9142 7.24939 15.5 7.24939H15.0105L14.2492 14.7095C14.2382 15.2023 14.0377 15.6726 13.6883 16.0219C13.3289 16.3814 12.8414 16.5833 12.333 16.5833H8.16638C7.65805 16.5833 7.17054 16.3814 6.81109 16.0219C6.46176 15.6726 6.2612 15.2023 6.25019 14.7095L5.48896 7.24939H5C4.58579 7.24939 4.25 6.9136 4.25 6.08518C4.25 5.74939 4.58579 5.74939 5 5.74939H6.16667H7.16638ZM7.91638 7.24996H12.583H13.5026L12.7536 14.5905C12.751 14.6158 12.7497 14.6412 12.7497 14.6666C12.7497 14.7771 12.7058 14.8831 12.6277 14.9613C12.5495 15.0394 12.4436 15.0833 12.333 15.0833H8.16638C8.05588 15.0833 7.94989 15.0394 7.87175 14.9613C7.79361 14.8831 7.74972 14.7771 7.74972 14.6666C7.74972 14.6412 7.74842 14.6158 7.74584 14.5905L6.99681 7.24996H7.91638Z" clip-rule="evenodd" fill-rule="evenodd"></path>
        </svg>
        <span class="tooltiptext">remove</span>
      </button>
    `;

    // Add delete button functionality
    const deleteButton = listItem.querySelector('button');
    deleteButton.addEventListener('click', () => {
      removeServer(index);
    });

    serverList.appendChild(listItem);
  });
}

// Remove server by index
function removeServer(index) {
  const servers = loadServers();
  servers.splice(index, 1); // Remove server at specified index
  saveServers(servers); // Save updated list to localStorage
  renderServerList(); // Re-render server list
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderServerList();
});


// Fetch and display servers when the page loads
fetchServers();
setInterval(fetchServers, 1000)
// Default to showing the chat page
showChatPage();
