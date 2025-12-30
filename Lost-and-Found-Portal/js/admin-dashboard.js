$(document).ready(function() {

    const itemsTableBody = $('#pending-items-table-body');
    const claimsTableBody = $('#pending-claims-table-body'); 

    
    async function fetchDashboardStats() {
        try {
            const response = await fetch('api/api.php?endpoint=get-stats');
            if (!response.ok) {
                console.error("Failed to fetch stats");
                return;
            }
            const stats = await response.json();
            $('#pending-count').text(stats.pending);
            $('#approved-count').text(stats.approved);
            $('#users-count').text(stats.users);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }

    
    async function fetchPendingItems() {
        try {
            const response = await fetch('api/api.php?endpoint=get-pending');
            if (!response.ok) {
                if (response.status === 401) {
                    alert('You are not logged in. Redirecting to login page.');
                    window.location.href = 'admin-login.html';
                    return;
                }
                throw new Error('Failed to fetch data');
            }
            const items = await response.json();
            renderItemsTable(items);
        } catch (error) {
            console.error('Error fetching items:', error);
            itemsTableBody.empty();
            itemsTableBody.append(`<tr><td colspan="6" class="text-center">Error loading items: ${error.message}</td></tr>`);
        }
    }

    
    function renderItemsTable(items) {
        itemsTableBody.empty();
        if (items.length === 0) {
            itemsTableBody.append('<tr><td colspan="6" class="text-center">No items are currently pending approval.</td></tr>');
        } else {
            items.forEach(item => {
                const imageUrl = item.image_url ? item.image_url : 'images/item-placeholder.png';
                const imageTag = `<img src="${imageUrl}" alt="${item.title}" class="admin-item-thumb">`;
                const row = `
                    <tr data-item-id="${item.item_id}">
                        <td><span class="badge ${item.item_type === 'lost' ? 'badge-danger' : 'badge-success'}">${item.item_type.toUpperCase()}</span></td>
                        <td>${imageTag}</td>
                        <td>${item.title}</td>
                        <td>${item.reported_by}</td>
                        <td>${item.item_date}</td>
                        <td>
                            <button class="btn btn-success btn-sm btn-approve" data-id="${item.item_id}">Approve</button>
                            <button class="btn btn-danger btn-sm btn-deny" data-id="${item.item_id}">Deny</button>
                        </td>
                    </tr>
                `;
                itemsTableBody.append(row);
            });
        }
    }

    
    async function handleItemAction(itemId, action) {
        const endpoint = action === 'approve' ? 'approve-item' : 'deny-item';
        try {
            const response = await fetch(`api/api.php?endpoint=${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_id: itemId })
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                $(`tr[data-item-id="${itemId}"]`).fadeOut(500, function() { $(this).remove(); });
                fetchDashboardStats(); // Refresh stats
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Action error:', error);
            alert('An unexpected error occurred.');
        }
    }

    
    itemsTableBody.on('click', '.btn-approve', function() {
        const itemId = $(this).data('id');
        if (confirm(`Are you sure you want to APPROVE this item?`)) {
            handleItemAction(itemId, 'approve');
        }
    });
    itemsTableBody.on('click', '.btn-deny', function() {
        const itemId = $(this).data('id');
        if (confirm(`Are you sure you want to DENY this item?`)) {
            handleItemAction(itemId, 'deny');
        }
    });

    
    async function fetchPendingClaims() {
        try {
            const response = await fetch('api/api.php?endpoint=get-pending-claims');
            if (!response.ok) {
                throw new Error('Failed to fetch claims');
            }
            const claims = await response.json();
            renderClaimsTable(claims);
        } catch (error) {
            console.error('Error fetching claims:', error);
            claimsTableBody.empty();
            claimsTableBody.append(`<tr><td colspan="5" class="text-center">Error loading claims: ${error.message}</td></tr>`);
        }
    }

    
    function renderClaimsTable(claims) {
        claimsTableBody.empty();
        if (claims.length === 0) {
            claimsTableBody.append('<tr><td colspan="5" class="text-center">No claims are currently pending review.</td></tr>');
        } else {
            claims.forEach(claim => {
                const row = `
                    <tr data-claim-id="${claim.claim_id}">
                        <td>${claim.item_title}</td>
                        <td>${claim.claimant_email}</td>
                        <td>${claim.proof_description}</td>
                        <td>${new Date(claim.claim_date).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-success btn-sm btn-approve-claim" data-id="${claim.claim_id}">Approve</button>
                            <button class="btn btn-danger btn-sm btn-deny-claim" data-id="${claim.claim_id}">Deny</button>
                        </td>
                    </tr>
                `;
                claimsTableBody.append(row);
            });
        }
    }

    
    async function handleClaimAction(claimId, action) {
        const endpoint = action === 'approve' ? 'approve-claim' : 'deny-claim';
        try {
            const response = await fetch(`api/api.php?endpoint=${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claim_id: claimId })
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                $(`tr[data-claim-id="${claimId}"]`).fadeOut(500, function() { $(this).remove(); });
                fetchDashboardStats(); // Refresh stats
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Action error:', error);
            alert('An unexpected error occurred.');
        }
    }

    
    claimsTableBody.on('click', '.btn-approve-claim', function() {
        const claimId = $(this).data('id');
        if (confirm(`Are you sure you want to APPROVE this claim?`)) {
            handleClaimAction(claimId, 'approve');
        }
    });
    claimsTableBody.on('click', '.btn-deny-claim', function() {
        const claimId = $(this).data('id');
        if (confirm(`Are you sure you want to DENY this claim?`)) {
            handleClaimAction(claimId, 'deny');
        }
    });

    
    fetchPendingItems();
    fetchDashboardStats();
    fetchPendingClaims(); 

});