const btns = document.querySelectorAll('.btn');
const instructorsList = document.getElementById('instructorsList');
const studentsList = document.getElementById('studentsList');
const addInstructorForm = document.getElementById('addInstructorForm');
const addStudentForm = document.getElementById('addStudentForm')

function setUp(){
    loadEventListeners()
}

function loadEventListeners(){
    btns.forEach((btn)=>{
        addListenerToBtn(btn)
    })
}

function addListenerToBtn(btn){
    btn.addEventListener('click', function(){
        handleClick(btn.id)
    })
}

function clearList(list){
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}

function formatInstructors(item){
    return `Instructor ID: ${item.instructor_id} | Name: ${item.instructor_name} | Specializes in: ${item.specialization}`;
}

function formatStudents(item){
    return `Student ID: ${item.student_id}, Name: ${item.student_name}, Instructor ID: ${item.instructor_id}`
}

function createDeleteButton(index, targetType) {
    const button = document.createElement('button');
    button.textContent = 'Delete';
    button.addEventListener('click', function() {
        deleteRequest(index, targetType);
    });
    return button;
}

function createEditButton(item, targetType) {
    const button = document.createElement('button');
    button.textContent = 'Edit';
    button.addEventListener('click', function() {
        // const id = targetType === 'instructors' ? item.instructor_id : item.student_id;
        editEntry(item, targetType);
    });
    return button;
}

function appendToList(list, data, targetType) {
    data.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = targetType === 'instructors' ? formatInstructors(item) : formatStudents(item);
        
        const deleteButton = createDeleteButton(item.instructor_id, targetType);
        const editButton = createEditButton(targetType === 'instructors' ? item.instructor_id : item.instructor_id, targetType);
        
        li.appendChild(deleteButton);
        li.appendChild(editButton);
        
        list.appendChild(li);
    });
}

function editEntry(index, targetType) {
    const baseUrl = window.location.origin;
    const endpoint = targetType === 'instructors' ? '/instructors' : '/students';
    const editForm = targetType === 'instructors' ? addInstructorForm : addStudentForm;
    const formData = new FormData(editForm);
    const jsonData = {};
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });
    fetch(`${baseUrl}${endpoint}/${index}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`Failed to edit entry: ${response.statusText}`);
            }
        })
        .then((data) => {
            handleClick(targetType);
        })
        .catch((error) => {
            console.error(error);
            alert(`Failed to edit entry: ${error.message}`);
        });
}

function handleClick(id){
    console.log(id)
    const baseUrl = window.location.origin;
    const endpoint = id === 'instructors' ? '/instructors' : '/students';
    const targetList = id === 'instructors' ? instructorsList : studentsList;
    const otherList = id === 'instructors' ? studentsList : instructorsList;
    clearList(targetList);
    fetch(`${baseUrl}${endpoint}`)
        .then((response) => response.json())
        .then((data) => {
            appendToList(targetList, data, id === 'instructors' ? 'instructors' : 'students');
        })
        .catch((error) => {
            console.error(error);
        });
    clearList(otherList);
}

function deleteRequest(index, targetType) {
    const baseUrl = window.location.origin;
    const endpoint = targetType === 'instructors' ? '/instructors' : '/students';
    fetch(`${baseUrl}${endpoint}/${index}`, { method: 'DELETE' })
        .then(async (response) => {
            if (response.ok) {
                handleClick(targetType);
            } else {
                if (response.status === 500) {
                    console.error('Failed to delete entry. Server error.');
                } else if (response.status === 400) {
                    const errorData = await response.json();
                    if (errorData.error && errorData.error.includes("foreign key constraint \"students_instructor_id_fkey\"")) {
                        alert("Cannot delete an instructor that has students!");
                    } else {
                        console.error('Failed to delete', errorData.error);
                    }
                } else {
                    console.error('Failed to delete entry. Unknown error.');
                }
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'Failed to delete entry' });
        });
}

function addEntry(targetType) {
    const studentData = new FormData(document.getElementById('addStudentForm'));
    const instructorData = new FormData(document.getElementById('addInstructorForm'));
    const jsonData = {};

    const formData = targetType === 'students' ? studentData : instructorData;

    formData.forEach((value, key) => {
        jsonData[key] = value;
    });
    jsonData['targetType'] = targetType;
    const endpoint = targetType === 'students' ? '/students' : '/instructors';
    fetch(`${window.location.origin}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`Failed to add entry: ${response.statusText}`);
            }
        })
        .then((data) => {
            handleClick(targetType);
        })
        .catch((error) => {
            console.error(error);
            alert(`Failed to add entry: ${error.message}`);
        });
}




setUp();