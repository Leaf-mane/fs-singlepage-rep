const btns = document.querySelectorAll('.btn');
const instructorsList = document.getElementById('instructorsList');
const studentsList = document.getElementById('studentsList');
const addEntryForm = document.getElementById('addEntryForm');

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
    return `Name: ${item.instructor_name} | Specializes in: ${item.specialization}`;
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

function appendToList(list, data, targetType){
    data.forEach((item)=> {
        const li = document.createElement('li');
        li.textContent = targetType === 'instructors' ? formatInstructors(item) : formatStudents(item);
        const deleteButton = createDeleteButton(item.instructor_id, targetType); 
        list.appendChild(li);
        list.appendChild(deleteButton);
    })
}



function handleClick(id){
    console.log(id)
    const baseUrl = window.location.origin;
    const endpoint = id === 'instructors' ? '/instructors' : '/students';
    const targetList = id === 'instructors' ? instructorsList : studentsList;
    const otherList = id === 'instructors' ? studentsList : instructorsList;
  
    clearList(targetList);

    fetch(`${baseUrl}${endpoint}`)
        .then((response)=>response.json())
        .then((data)=>{
            appendToList(targetList, data, id === 'instructors' ? 'instructors' : 'students');
        })
        .catch((error)=>{
            console.error(error);
        })
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
    // Get form data
    const formData = new FormData(document.getElementById('addEntryForm'));

    // Convert formData to JSON
    const jsonData = {};
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    // Determine endpoint based on the form
    const endpoint = targetType === 'students' ? '/students' : '/instructors';

    // Make a POST request to add the entry
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
            // Refresh the list after adding the entry
            handleClick(targetType);
        })
        .catch((error) => {
            console.error(error);
            alert('Failed to add entry. Please try again later.');
        });
}


setUp();