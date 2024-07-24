document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Handle form submission 
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-display').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-display').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch the emails for the specified mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // Clear previous emails
    document.querySelector('#emails-view').innerHTML += '';

    // Loop through each email and create a div for it
    emails.forEach(email => {
      const emailDiv = document.createElement('div');
      emailDiv.className = 'email';
      emailDiv.dataset.emailId = email.id; // Set the email id as a data attribute

      if (mailbox === 'inbox') {
        emailDiv.innerHTML = `
          <span>${email.sender}</span>
          <span>${email.subject}</span>
          <span>${email.timestamp}</span>
          <button class="btn btn-sm btn-outline-primary archive-btn">Archive</button>
        `;
      } else if (mailbox === 'archive') {
        emailDiv.innerHTML = `
          <span>${email.sender}</span>
          <span>${email.subject}</span>
          <span>${email.timestamp}</span>
          <button class="btn btn-sm btn-outline-primary unarchive-btn">Unarchive</button>
        `;
      } else {
        emailDiv.innerHTML = `
          <span>${email.sender}</span>
          <span>${email.subject}</span>
          <span>${email.timestamp}</span>
        `;
      }

      emailDiv.style.border = '1px solid black';
      emailDiv.style.padding = '10px';
      emailDiv.style.margin = '10px';
      emailDiv.style.cursor = 'pointer';

      // Set background color based on whether the email is read or not
      emailDiv.style.backgroundColor = email.read ? 'lightgray' : 'white';

      // Append the email div to the emails-view
      document.querySelector('#emails-view').appendChild(emailDiv);

      // Handle email clicks
      emailDiv.addEventListener('click', () => display_email(email.id));

      // Handle (un)archive buttons
      const archiveButton = emailDiv.querySelector('.archive-btn');
      const unarchiveButton = emailDiv.querySelector('.unarchive-btn');

      if (archiveButton) {
        archiveButton.addEventListener('click', event => {
          event.stopPropagation();
          archive_email(email.id)
        });
      }

      if (unarchiveButton) {
        unarchiveButton.addEventListener('click', event => {
          event.stopPropagation();
          unarchive_email(email.id)
        });
      }
    });
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

function send_email(event) {
  event.preventDefault();

  const recipient = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipient,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
    // Load the sent mailbox
    load_mailbox('sent');
  });
}

function display_email(email_id) {
  // Fetch the email
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    // Show the email content
    document.querySelector('#email-display').innerHTML = `
      <div>
        <h5>From: ${email.sender}</h5>
        <h5>To: ${email.recipients}</h5>
        <h5>Subject: ${email.subject}</h5>
        <h5>Timestamp: ${email.timestamp}</h5>
        <hr>
        <p>${email.body}</p>
      </div>
    `;

    // Show the email view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-display').style.display = 'block';
  })
  .catch(error => {
    console.error('Error:', error);
  });

  // Mark the email as read
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });
}

function archive_email(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  .then(() => {
    load_mailbox('inbox') 
  })
}

function unarchive_email(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  .then(() => {
    load_mailbox('archive') 
  })
}
