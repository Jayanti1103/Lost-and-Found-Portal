$(document).ready(function() {
    
    const tableBody = $('#all-items-table-body');
    const searchButton = $('#search-button');
    const searchInput = $('#search-all-items');
    const statusFilter = $('#filter-status');

    
    async function fetchAllItems(searchTerm = '', statusTerm = '') {
        
        tableBody.empty().append('<tr><td colspan="6" class="text-center">Loading items...</td></tr>');

        try {
            
            const url = `api/api.php?endpoint=get-all-items&search=${encodeURIComponent(searchTerm)}&status=${encodeURIComponent(statusTerm)}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 401) {
                    alert('You are not logged in. Redirecting to login page.');
                    window.location.href = 'admin-login.html';
                    return;
                }
                throw new Error('Failed to fetch data');
            }

            const items = await response.json();
            renderTable(items);

        } catch (error) {
            console.error('Error fetching items:', error);
            tableBody.empty().append(`<tr><td colspan="6" class="text-center">Error loading items: ${error.message}</td></tr>`);
        }
    }

    
    function renderTable(items) {
        tableBody.empty();
        if (items.length === 0) {
            tableBody.append('<tr><td colspan="6" class="text-center">No items found matching your criteria.</td></tr>');
        } else {
            items.forEach(item => {
                const imageUrl = item.image_url ? item.image_url : 'images/item-placeholder.png';
                const imageTag = `<img src="${imageUrl}" alt="${item.title}" class="admin-item-thumb">`;
                
                
                let statusClass = 'badge-secondary';
                if (item.status === 'pending') statusClass = 'status-pending';
                if (item.status === 'approved') statusClass = 'status-approved';
                if (item.status === 'claimed') statusClass = 'status-claimed';
                if (item.status === 'denied') statusClass = 'status-denied';

                const row = `
                    <tr data-item-id="${item.item_id}">
                        <td><span class="status-badge ${statusClass}">${item.status}</span></td>
                        <td>${imageTag}</td>
                        <td>${item.title}</td>
                        <td>${item.reported_by}</td>
                        <td>${item.item_date}</td>
                        <td>
                            <button class="btn btn-danger btn-sm btn-delete" data-id="${item.item_id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.append(row);
            });
        }
    }

    
    async function deleteItem(itemId) {
        try {
            const response = await fetch(`api/api.php?endpoint=delete-item`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_id: itemId })
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                $(`tr[data-item-id="${itemId}"]`).fadeOut(500, function() { $(this).remove(); });
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Action error:', error);
            alert('An unexpected error occurred.');
        }
    }

    
    
    searchButton.on('click', function() {
        const searchTerm = searchInput.val();
        const statusTerm = statusFilter.val();
        fetchAllItems(searchTerm, statusTerm);
    });

    
    tableBody.on('click', '.btn-delete', function() {
        const itemId = $(this).data('id');
        if (confirm(`Are you sure you want to PERMANENTLY DELETE this item? This will also delete all associated claims. This action cannot be undone.`)) {
            deleteItem(itemId);
        }
    });

    
    fetchAllItems();

});