const btns = document.querySelectorAll('.btn');
const instructorsList = document.getElementById('instructorsList');
const studentsList = document.getElementById('studentsList');


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

function appendToList(list, data, targetType){
    data.forEach((item)=> {
        const li = document.createElement('li');
        li.textContent = targetType === 'instructors' ? formatInstructors(item) : formatStudents(item);
        list.appendChild(li);
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

setUp();