// Data storage
let people = JSON.parse(localStorage.getItem('dutyPeople')) || [];
let unavailability = JSON.parse(localStorage.getItem('dutyUnavailability')) || [];
let assignments = JSON.parse(localStorage.getItem('dutyAssignments')) || [];

// Migrate existing people to new format with duty counter
function migratePeopleData() {
    let needsMigration = false;
    people = people.map(person => {
        if (typeof person === 'string') {
            needsMigration = true;
            return { name: person, dutyCount: 0 };
        }
        return person;
    });
    
    if (needsMigration) {
        // Count existing assignments for each person
        people.forEach(person => {
            person.dutyCount = assignments.reduce((count, assignment) => {
                return count + assignment.assignedPeople.filter(name => name === person.name).length;
            }, 0);
        });
        savePeople();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    migratePeopleData();
    updatePeopleList();
    updatePersonSelect();
    updateUnavailabilityList();
    updateAssignmentsList();
    updateTotalPeopleCounter();
    setDefaultDates();
});

// Tab switching
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// People management
function addPerson() {
    const nameInput = document.getElementById('personName');
    const name = nameInput.value.trim();
    
    if (!name) {
        showNotification('Please enter a name', 'error');
        return;
    }
    
    if (people.find(person => person.name === name)) {
        showNotification('Person already exists', 'error');
        return;
    }
    
    people.push({ name: name, dutyCount: 0 });
    savePeople();
    updatePeopleList();
    updatePersonSelect();
    nameInput.value = '';
    showNotification('Person added successfully', 'success');
}

function removePerson(name) {
    const index = people.findIndex(person => person.name === name);
    if (index > -1) {
        people.splice(index, 1);
        
        // Remove all unavailability records for this person
        unavailability = unavailability.filter(item => item.person !== name);
        
        // Remove from any assignments
        assignments.forEach(assignment => {
            assignment.assignedPeople = assignment.assignedPeople.filter(person => person !== name);
        });
        
        savePeople();
        saveUnavailability();
        saveAssignments();
        updatePeopleList();
        updatePersonSelect();
        updateUnavailabilityList();
        updateAssignmentsList();
        showNotification('Person removed successfully', 'success');
    }
}

function updatePeopleList() {
    const peopleList = document.getElementById('peopleList');
    
    if (people.length === 0) {
        peopleList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>No people added yet. Add someone to get started!</p>
            </div>
        `;
    } else {
        peopleList.innerHTML = people.map(person => `
            <div class="person-card">
                <div class="person-info">
                    <span class="person-name"><i class="fas fa-user"></i> ${person.name}</span>
                    <span class="duty-counter">
                        <i class="fas fa-clipboard-check"></i> 
                        Duties: <strong>${person.dutyCount}</strong>
                    </span>
                </div>
                <button class="delete-btn" onclick="removePerson('${person.name}')">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `).join('');
    }
    
    updateTotalPeopleCounter();
}

function updatePersonSelect() {
    const personSelect = document.getElementById('personSelect');
    personSelect.innerHTML = '<option value="">Select a person</option>';
    
    people.forEach(person => {
        personSelect.innerHTML += `<option value="${person.name}">${person.name} (${person.dutyCount} duties)</option>`;
    });
}

function updateTotalPeopleCounter() {
    const totalPeopleElement = document.getElementById('totalPeopleCount');
    if (totalPeopleElement) {
        totalPeopleElement.textContent = people.length;
    }
}

// Availability management
function markUnavailable() {
    const personSelect = document.getElementById('personSelect');
    const dateInput = document.getElementById('unavailableDate');
    
    const person = personSelect.value;
    const date = dateInput.value;
    
    if (!person) {
        showNotification('Please select a person', 'error');
        return;
    }
    
    if (!date) {
        showNotification('Please select a date', 'error');
        return;
    }
    
    // Check if already marked unavailable
    const existing = unavailability.find(item => 
        item.person === person && item.date === date
    );
    
    if (existing) {
        showNotification('Person is already marked unavailable for this date', 'error');
        return;
    }
    
    unavailability.push({ person, date });
    saveUnavailability();
    updateUnavailabilityList();
    
    personSelect.value = '';
    dateInput.value = '';
    showNotification('Unavailability marked successfully', 'success');
}

function removeUnavailability(person, date) {
    unavailability = unavailability.filter(item => 
        !(item.person === person && item.date === date)
    );
    saveUnavailability();
    updateUnavailabilityList();
    showNotification('Unavailability removed', 'success');
}

function updateUnavailabilityList() {
    const unavailabilityList = document.getElementById('unavailabilityList');
    
    if (unavailability.length === 0) {
        unavailabilityList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-check"></i>
                <p>No unavailability marked. Everyone is available!</p>
            </div>
        `;
        return;
    }
    
    // Sort by date
    const sortedUnavailability = [...unavailability].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
    );
    
    unavailabilityList.innerHTML = sortedUnavailability.map(item => `
        <div class="unavailability-card">
            <div class="unavailable-date">
                <i class="fas fa-calendar-times"></i> ${formatDate(item.date)}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span><i class="fas fa-user"></i> ${item.person}</span>
                <button class="delete-btn" onclick="removeUnavailability('${item.person}', '${item.date}')">
                    <i class="fas fa-check"></i> Available
                </button>
            </div>
        </div>
    `).join('');
}

// Assignment management
function assignDuty() {
    const dateInput = document.getElementById('dutyDate');
    const date = dateInput.value;
    
    if (!date) {
        showNotification('Please select a date', 'error');
        return;
    }
    
    if (people.length < 2) {
        showNotification('Need at least 2 people to make assignments', 'error');
        return;
    }
    
    const result = createSingleAssignment(date);
    if (result.success) {
        savePeople();
        saveAssignments();
        updatePeopleList();
        updatePersonSelect();
        updateAssignmentsList();
        dateInput.value = getTodayString();
        
        showNotification(result.message, 'success');
    } else {
        showNotification(result.message, 'error');
    }
}

function createSingleAssignment(date) {
    // Check if assignment already exists for this date
    const existing = assignments.find(assignment => assignment.date === date);
    if (existing) {
        return {
            success: false,
            message: `Assignment already exists for ${formatDate(date)}`
        };
    }
    
    // Get available people for this date
    const unavailableForDate = unavailability
        .filter(item => item.date === date)
        .map(item => item.person);
    
    const availablePeople = people.filter(person => 
        !unavailableForDate.includes(person.name)
    );
    
    if (availablePeople.length < 2) {
        return {
            success: false,
            message: `Only ${availablePeople.length} people available on ${formatDate(date)}. Need at least 2.`
        };
    }
    
    // Smart assignment considering duty count
    const assignedPeople = selectPeopleByDutyCount(availablePeople);
    
    // Update duty counters for assigned people
    assignedPeople.forEach(personName => {
        const person = people.find(p => p.name === personName);
        if (person) {
            person.dutyCount++;
        }
    });
    
    assignments.push({
        date,
        assignedPeople,
        createdAt: new Date().toISOString()
    });
    
    return {
        success: true,
        message: `Assigned ${assignedPeople.join(' and ')} for ${formatDate(date)}`
    };
}

function assignWeekForward() {
    if (people.length < 2) {
        showNotification('Need at least 2 people to make assignments', 'error');
        return;
    }
    
    const startDate = getTodayString();
    const results = [];
    const errors = [];
    
    // Create assignments for 7 days starting from today
    for (let i = 0; i < 7; i++) {
        const currentDate = addDaysToDate(startDate, i);
        const result = createSingleAssignment(currentDate);
        
        if (result.success) {
            results.push(result.message);
        } else {
            errors.push(result.message);
        }
    }
    
    // Save all changes
    savePeople();
    saveAssignments();
    updatePeopleList();
    updatePersonSelect();
    updateAssignmentsList();
    
    // Show summary notification
    if (results.length > 0) {
        showNotification(
            `Created ${results.length} assignments for the next week${errors.length > 0 ? `. ${errors.length} days skipped due to conflicts or insufficient availability.` : '.'}`,
            results.length === 7 ? 'success' : 'info'
        );
    } else {
        showNotification('No assignments could be created. Check availability and existing assignments.', 'error');
    }
}

function removeAssignment(date) {
    // Find the assignment to be removed
    const assignmentToRemove = assignments.find(assignment => assignment.date === date);
    
    if (assignmentToRemove) {
        // Decrease duty counters for assigned people
        assignmentToRemove.assignedPeople.forEach(personName => {
            const person = people.find(p => p.name === personName);
            if (person && person.dutyCount > 0) {
                person.dutyCount--;
            }
        });
    }
    
    assignments = assignments.filter(assignment => assignment.date !== date);
    savePeople();
    saveAssignments();
    updatePeopleList();
    updatePersonSelect();
    updateAssignmentsList();
    showNotification('Assignment removed', 'success');
}

function updateAssignmentsList() {
    const assignmentsList = document.getElementById('assignmentsList');
    
    if (assignments.length === 0) {
        assignmentsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>No duty assignments yet. Create your first assignment!</p>
            </div>
        `;
        return;
    }
    
    // Sort by date
    const sortedAssignments = [...assignments].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
    );
    
    assignmentsList.innerHTML = sortedAssignments.map(assignment => `
        <div class="assignment-card">
            <div class="assignment-date">
                <i class="fas fa-calendar-check"></i> ${formatDate(assignment.date)}
            </div>
            <div class="assigned-people">
                ${assignment.assignedPeople.map(person => 
                    `<span class="person-badge">${person}</span>`
                ).join('')}
            </div>
            <div style="margin-top: 15px;">
                <button class="delete-btn" onclick="removeAssignment('${assignment.date}')">
                    <i class="fas fa-trash"></i> Remove Assignment
                </button>
            </div>
        </div>
    `).join('');
}

// Smart assignment function
function selectPeopleByDutyCount(availablePeople) {
    if (availablePeople.length === 2) {
        return availablePeople.map(person => person.name);
    }
    
    // Sort by duty count (ascending) to prioritize people with fewer duties
    const sortedByDutyCount = [...availablePeople].sort((a, b) => {
        if (a.dutyCount !== b.dutyCount) {
            return a.dutyCount - b.dutyCount;
        }
        // If duty counts are equal, randomize
        return Math.random() - 0.5;
    });
    
    // Find the minimum duty count
    const minDutyCount = sortedByDutyCount[0].dutyCount;
    
    // Get all people with the minimum duty count
    const peopleWithMinDuty = sortedByDutyCount.filter(person => 
        person.dutyCount === minDutyCount
    );
    
    if (peopleWithMinDuty.length >= 2) {
        // If we have 2 or more people with minimum duties, randomly select 2 from them
        const shuffled = [...peopleWithMinDuty].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 2).map(person => person.name);
    } else {
        // Take the person with minimum duties, then find next best option
        const selected = [peopleWithMinDuty[0]];
        
        // Find people with the next lowest duty count
        const remaining = sortedByDutyCount.filter(person => 
            person.dutyCount !== minDutyCount
        );
        
        if (remaining.length > 0) {
            const nextMinDutyCount = remaining[0].dutyCount;
            const peopleWithNextMinDuty = remaining.filter(person => 
                person.dutyCount === nextMinDutyCount
            );
            
            // Randomly select one from the next best group
            const randomIndex = Math.floor(Math.random() * peopleWithNextMinDuty.length);
            selected.push(peopleWithNextMinDuty[randomIndex]);
        }
        
        return selected.map(person => person.name);
    }
}

// Date utility functions
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dutyDate').value = today;
    document.getElementById('unavailableDate').value = today;
}

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function addDaysToDate(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Storage functions
function savePeople() {
    localStorage.setItem('dutyPeople', JSON.stringify(people));
}

function saveUnavailability() {
    localStorage.setItem('dutyUnavailability', JSON.stringify(unavailability));
}

function saveAssignments() {
    localStorage.setItem('dutyAssignments', JSON.stringify(assignments));
}

// Add Enter key support for adding people
document.getElementById('personName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addPerson();
    }
}); 