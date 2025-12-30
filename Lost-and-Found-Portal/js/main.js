
(async function checkLoginStatus() {
    try {
        const response = await fetch('api/api.php?endpoint=check-auth');
        const result = await response.json();

        if (result.logged_in) {
            
            $('#nav-login').hide();
            $('#nav-register').hide();
            $('#nav-my-reports').show();
            $('#nav-logout').show();
        } else {
            
            $('#nav-login').show();
            $('#nav-register').show();
            $('#nav-my-reports').hide();
            $('#nav-logout').hide();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        
        $('#nav-login').show();
        $('#nav-register').show();
        $('#nav-my-reports').hide();
        $('#nav-logout').hide();
    }
})();




$(document).ready(function() {

    
    var path = window.location.pathname;
    var page = path.split("/").pop();
    if (page == "") {
        page = "index.html";
    }
    var navLinks = $(".navbar-nav .nav-link");
    navLinks.each(function() {
        var href = $(this).attr("href");
        if (href == page) {
            $(this).closest(".nav-item").addClass("active");
        }
    });
    

    
    $('#nav-logout').on('click', async function(event) {
        event.preventDefault(); 

        try {
            await fetch('api/api.php?endpoint=logout');
            alert('You have been logged out.');
            window.location.href = 'index.html'; 
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed. Please try again.');
        }
    });
    


   
    $('#item-list').on('click', '[data-toggle="modal"]', function(event) {
        var button = $(this); 
        var itemTitle = button.data('item-title'); 
        var itemId = button.data('item-id'); 

        var modal = $('#claimModal');
        modal.find('#claimItemTitle').text('Claiming: ' + itemTitle);
        modal.data('item-id', itemId); 
    });

    $('#submitClaimButton').on('click', async function() {
        const form = $('#claimForm');
        const proof = $('#claimProof').val().trim();
        const itemId = $('#claimModal').data('item-id');

        if (proof === '') {
            alert('Please provide proof of ownership.');
            return;
        }

        const formData = {
            item_id: itemId,
            proof: proof
        };

        try {
            const response = await fetch('api/api.php?endpoint=submit-claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                $('#claimModal').modal('hide');
                form[0].reset();
            } else {
                alert('Error: ' + result.error);
                if (response.status === 401) {
                    window.location.href = 'login.html'; 
                }
            }

        } catch (error) {
            console.error('Claim submission error:', error);
            alert('An unexpected error occurred. Please try again.');
        }
    });
    


    
    $('#item_image').on('change', function(event) {
        var file = event.target.files[0];
        if (file) {
            $('#image-label').text(file.name);
            var reader = new FileReader();
            reader.onload = function(e) {
                var preview = $('#image-preview');
                preview.attr('src', e.target.result);
                preview.show(); 
            };
            reader.readAsDataURL(file);
        } else {
            $('#image-label').text('Choose file...');
            $('#image-preview').hide().attr('src', '#');
        }
    });

    $('#reportForm').on('submit', async function(event) {
        event.preventDefault();
        $('#report-success').hide().text('');
        $('#report-error').hide().text('');
        var formData = new FormData(this);
        var fileInput = $('#item_image')[0];
        if (fileInput.files.length > 0) {
            formData.append('item_image', fileInput.files[0]);
        }
        try {
            const response = await fetch('api/api.php?endpoint=report', {
                method: 'POST',
                body: formData 
            });
            const result = await response.json();
            if (response.ok) {
                $('#report-success').text(result.message).show();
                $('#reportForm')[0].reset(); 
                $('#image-preview').hide(); 
                $('#image-label').text('Choose file...'); 
            } else {
                $('#report-error').text(result.error).show();
            }
        } catch (error) {
            console.error('Error:', error);
            $('#report-error').text('An unexpected error occurred. Please try again.').show();
        }
    });
    


    $('#registerForm').on('submit', async function(event) {
        
        event.preventDefault();
        
        function showError(inputId, message) {
            var input = $(inputId);
            input.addClass('is-invalid'); 
            input.siblings('.invalid-feedback').text(message).show(); 
        }
        function clearAllErrors() {
            $('#registerForm .form-control').removeClass('is-invalid');
            $('#registerForm .invalid-feedback').text('').hide();
            $('#register-success').hide();
            $('#register-error').hide().text(''); 
        }

        clearAllErrors();
        var isValid = true; 

        var name = $('#userName').val().trim();
        var email = $('#userEmail').val().trim();
        var phone = $('#userPhone').val().trim(); 
        var pass1 = $('#userPassword').val().trim();
        var pass2 = $('#confirmPassword').val().trim();

        if (name === '') {
            showError('#userName', 'Please enter your name.');
            isValid = false;
        }
        if (email === '') {
            showError('#userEmail', 'Please enter your email address.');
            isValid = false;
        }

        
        if (phone === '') {
             showError('#userPhone', 'Please enter your phone number.');
             isValid = false;
        } else if (!/^\d{10}$/.test(phone)) {
             showError('#userPhone', 'Please enter a valid 10-digit phone number.');
             isValid = false;
        }

        
        var strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

        if (pass1 === '') {
            showError('#userPassword', 'Please create a password.');
            isValid = false;
        } else if (!strongPasswordRegex.test(pass1)) {
            showError('#userPassword', 'Password too weak. Must have 8+ chars, 1 uppercase, 1 number, 1 symbol.');
            isValid = false;
        }

        if (pass2 === '') {
            showError('#confirmPassword', 'Please confirm your password.');
            isValid = false;
        } else if (pass1 !== pass2) {
            showError('#confirmPassword', 'Passwords do not match.');
            isValid = false;
        }

        if (isValid) {
            
            var formData = {
                username: name,
                email: email,
                phone: phone, 
                password: pass1
            };

            try {
                const response = await fetch('api/api.php?endpoint=register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    $('#register-success').text(result.message).show(); 
                    $('#registerForm')[0].reset(); 
                } else {
                    $('#register-error').text(result.error).show();
                }
                
            } catch (error) {
                console.error('Error:', error);
                $('#register-error').text('An unexpected error occurred. Please try again.').show();
            }
        }
    });
    


    
    $('#loginForm').on('submit', async function(event) {
        event.preventDefault();
        $('#login-error').hide().text('');
        var email = $('#userEmail').val().trim();
        var password = $('#userPassword').val().trim();
        if (email === '' || password === '') {
            $('#login-error').text('Email and password are required.').show();
            return;
        }
        var formData = {
            email: email,
            password: password
        };
        try {
            const response = await fetch('api/api.php?endpoint=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (response.ok) {
                alert('Welcome back, ' + result.username + '!');
                window.location.href = 'my_reports.html';
            } else {
                $('#login-error').text(result.error).show();
            }
        } catch (error) {
            console.error('Error:', error);
            $('#login-error').text('An unexpected error occurred. Please try again.').show();
        }
    });
    


    
    if (window.location.pathname.includes('claim.html')) {
        const itemList = $('#item-list');
        const loadingMsg = $('#loading-message');

        async function fetchApprovedItems() {
            try {
                const response = await fetch('api/api.php?endpoint=items');

                if (!response.ok) {
                    try {
                        const err_data = await response.json(); 
                        throw new Error(err_data.error || 'Failed to fetch items from API.');
                    } catch (e) {
                        throw new Error(`Server error: ${response.status} ${response.statusText}`);
                    }
                }

                const items = await response.json();

                if(loadingMsg.length) {
                    loadingMsg.parent().remove(); 
                }

                if (items.length === 0) {
                    itemList.append('<div class="col-12"><p class="text-center">No "found" items have been approved yet.</p></div>');
                } else {
                    items.forEach(item => {
                        const imageUrl = item.image_url ? item.image_url : 'images/item-placeholder.png';
                        const itemCard = `
                            <div classM="col-md-6 col-lg-4 mb-4">
                                <div class="card item-card shadow-sm h-100">
                                    <img src="${imageUrl}" class="card-img-top" alt="${item.title}">
                                    <div class="card-body"> 
                                        <h5 class="card-title">${item.title}</h5>
                                        <p class="card-text">${item.description || 'No description provided.'}</p>
                                        <ul class="list-unstyled text-muted">
                                            <li><i class="fas fa-map-marker-alt fa-fw"></i> <b>Location:</b> ${item.location}</li>
                                            <li><i class="fas fa-calendar-alt fa-fw"></i> <b>Found on:</b> ${item.item_date}</li>
                                        </ul>
                                        <button type="button" class="btn btn-primary btn-block" 
                                                data-toggle="modal" data-target="#claimModal" 
                                                data-item-title="${item.title}"
                                                data-item-id="${item.item_id}">
                                            Claim Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                        itemList.append(itemCard);
                    });
                }
            } catch (error) { 
                console.error('Error fetching items:', error);

                
                if (error.message.includes('401') || error.message.includes('You must be logged in')) {
                    alert('You must be logged in to view this page.');
                    window.location.href = 'login.html';
                } else if(loadingMsg.length) {
                    
                    loadingMsg.parent().html(`<p class="text-center text-danger">Error loading items: ${error.message}</p>`);
                }
            }
        }
        fetchApprovedItems();
    }
    


    
    if (window.location.pathname.includes('my_reports.html')) {
        const lostTableBody = $('#lost-items-table-body');
        const foundTableBody = $('#found-items-table-body');

        function getStatusBadge(status) {
            let badgeClass = 'badge-secondary';
            if (status === 'pending') badgeClass = 'status-pending';
            if (status === 'approved') badgeClass = 'status-approved';
            if (status === 'claimed') badgeClass = 'status-claimed';
            if (status === 'denied') badgeClass = 'status-denied';
            return `<span class="status-badge ${badgeClass}">${status}</span>`;
        }

        function renderReportsTable(tableBody, items, emptyMessage) {
            tableBody.empty(); 
            if (items.length === 0) {
                tableBody.append(`<tr><td colspan="4" class="text-center">${emptyMessage}</td></tr>`);
            } else {
                items.forEach(item => {
                    const row = `
                        <tr>
                            <td><b>${item.title}</b></td>
                            <td>${item.item_date}</td>
                            <td>${item.location || 'N/A'}</td>
                            <td>${getStatusBadge(item.status)}</td>
                        </tr>
                    `;
                    tableBody.append(row);
                });
            }
        }

        async function fetchMyReports() {
            try {
                const response = await fetch('api/api.php?endpoint=get-my-reports');
                if (!response.ok) {
                    if (response.status === 401) {
                        alert('You are not logged in. Redirecting to login page.');
                        window.location.href = 'login.html';
                    }
                    throw new Error('Failed to fetch reports.');
                }
                const result = await response.json();
                renderReportsTable(lostTableBody, result.lost_items, 'You have not reported any lost items.');
                renderReportsTable(foundTableBody, result.found_items, 'You have not reported any found items.');
            } catch (error) {
                console.error('Error fetching reports:', error);
                lostTableBody.html(`<tr><td colspan="4" class="text-center text-danger">Error loading reports.</td></tr>`);
                foundTableBody.html(`<tr><td colspan="4" class="text-center text-danger">Error loading reports.</td></tr>`);
            }
        }
        fetchMyReports();
    }
    
    
    $('#feedbackForm').on('submit', async function(event) {
        event.preventDefault();
        const successMsg = $('#feedback-success');
        const errorMsg = $('#feedback-error');
        successMsg.hide();
        errorMsg.hide();
        const formData = {
            name: $('#feedbackName').val().trim(),
            email: $('#feedbackEmail').val().trim(),
            rating: $('#feedbackRating').val(),
            message: $('#feedbackMessage').val().trim()
        };
        if (!formData.rating || !formData.message) {
            errorMsg.text('Please provide a rating and a message.').show();
            return;
        }
        try {
            const response = await fetch('api/api.php?endpoint=submit-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (response.ok) {
                successMsg.text(result.message).show();
                $('#feedbackForm')[0].reset();
            } else {
                errorMsg.text(result.error).show();
            }
        } catch (error) {
            console.error('Feedback form error:', error);
            errorMsg.text('An unexpected error occurred. Please try again.').show();
        }
    });
    

    
    $('#contactForm').on('submit', async function(event) {
        event.preventDefault();
        const successMsg = $('#contact-success');
        const errorMsg = $('#contact-error');
        successMsg.hide();
        errorMsg.hide();
        const formData = {
            name: $('#userName').val().trim(),
            email: $('#userEmail').val().trim(),
            message: $('#userMessage').val().trim()
        };
        if (!formData.name || !formData.email || !formData.message) {
            errorMsg.text('Please fill out all fields.').show();
            return;
        }
        try {
            const response = await fetch('api/api.php?endpoint=submit-contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (response.ok) {
                successMsg.text(result.message).show();
                $('#contactForm')[0].reset();
            } else {
                errorMsg.text(result.error).show();
            }
        } catch (error) {
            console.error('Contact form error:', error);
            errorMsg.text('An unexpected error occurred. Please try again.').show();
        }
    });
    

}); 



if ('IntersectionObserver' in window) {

    const elementsToAnimate = document.querySelectorAll('.scroll-animate');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });

} 