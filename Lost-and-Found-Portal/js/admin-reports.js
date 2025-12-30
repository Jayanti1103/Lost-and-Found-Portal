$(document).ready(function() {
    
    const feedbackTable = $('#feedback-table-body');
    const messagesTable = $('#messages-table-body');

    
    async function fetchFeedback() {
        try {
            const response = await fetch('api/api.php?endpoint=get-all-feedback');
            const data = await response.json();

            feedbackTable.empty();
            if (data.length === 0) {
                feedbackTable.append('<tr><td colspan="4" class="text-center">No feedback received yet.</td></tr>');
                return;
            }

            data.forEach(item => {
                
                let stars = '';
                for(let i=0; i<item.rating; i++) stars += '★';
                
                
                let userDisplay = 'Anonymous';
                if (item.name) userDisplay = `${item.name} <br><small class="text-muted">${item.email}</small>`;

                const row = `
                    <tr>
                        <td class="text-warning" style="font-size: 1.2em;">${stars}</td>
                        <td>${userDisplay}</td>
                        <td>${item.message}</td>
                        <td>${new Date(item.submitted_at).toLocaleDateString()}</td>
                    </tr>
                `;
                feedbackTable.append(row);
            });

        } catch (error) {
            console.error('Error loading feedback:', error);
            feedbackTable.html('<tr><td colspan="4" class="text-center text-danger">Error loading data.</td></tr>');
        }
    }

    
    async function fetchMessages() {
        try {
            const response = await fetch('api/api.php?endpoint=get-all-messages');
            const data = await response.json();

            messagesTable.empty();
            if (data.length === 0) {
                messagesTable.append('<tr><td colspan="4" class="text-center">No messages received yet.</td></tr>');
                return;
            }

            data.forEach(msg => {
                const row = `
                    <tr>
                        <td>${msg.name}</td>
                        <td><a href="mailto:${msg.email}">${msg.email}</a></td>
                        <td>${msg.message}</td>
                        <td>${new Date(msg.submitted_at).toLocaleDateString()}</td>
                    </tr>
                `;
                messagesTable.append(row);
            });

        } catch (error) {
            console.error('Error loading messages:', error);
            messagesTable.html('<tr><td colspan="4" class="text-center text-danger">Error loading data.</td></tr>');
        }
    }

    
    
    fetchFeedback();
    fetchMessages();
});