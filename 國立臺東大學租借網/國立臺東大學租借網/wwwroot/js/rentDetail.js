function loadFacilities() {
    //const token = getCookie('token');

    fetch('https://localhost:7204/api/FacilityApi/facilities', {
        method: 'GET',
        /*headers: {
            'Authorization': `Bearer ${token}`,
        },*/
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // 背景圖片
            const container = document.getElementById('FacilityIdImgContainer');
            // 場地簡介
            const container1 = document.getElementById('FacilityIdContainer');
            // 場地信息內容
            const container2 = document.getElementById('Sitearea');
            // 場地圖片
            const container3 = document.getElementById('Siteimg');
            container.innerHTML = ''; // 清空容器以便新增新的卡片
            
            // 2/5完成這裡
            data.forEach(facility => {
                if (facility.id === factilityid) {       
                    const facilityImgHtml = `                     
                          <img src="${facility.imageUrl}" class="img-fluid w-100" alt="Facility Image" style="max-height: 850px; height: auto;filter: brightness(100%) opacity(80%);">                
                    `;
                    const facilityHtml = `
                    <div class="col-lg-12 p-0">
                      <div class="card custom-rounded p-2">
                        
                            <div class="card-body custom-rounded">
                              <h5>${facility.location}</h5>
                              <h1 class="text-success fw-bold">${facility.name}</h1>
                              <p class="card-text text-muted">${facility.description}</p>
                              <p class="card-text text-muted">面積: ${facility.area} 平方米</p>
                            </div>
                            
                         
                      </div>
                    </div>`;
                    const SiteareaHtml = `                     
                          <h5>${facility.area} 平方公尺</h5>
                    `;   
                    const SiteImgHtml = `  
                          <br>
                          <img src="${facility.imageUrl}" class="img-fluid w-10" alt="Facility Image" style="max-height: 250px; height: auto;filter: brightness(100%) opacity(80%);">                
                    `;

                    container.innerHTML += facilityImgHtml;
                    container1.innerHTML += facilityHtml;
                    container2.innerHTML += SiteareaHtml;
                    container3.innerHTML += SiteImgHtml;
                }
            });
        })
        .catch(error => console.error('Error:', error));
}

const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
];

// Global variable
// 周參數
let currentWeekIndex = 0;
// 存放所有預定資訊
let bookings = [];
let userid;
let factilityid;

function updateCalendar() {
    const daysOfWeek = ["日", "一", "二", "三", "四", "五", "六"];
    const tableHeaders = document.querySelectorAll(".table th");
    const currentDate = new Date();
    const tableBody = document.querySelector(".table tbody");

    currentDate.setDate(currentDate.getDate() + currentWeekIndex * 7);
    tableBody.innerHTML = ""; // 清空現有表格

    for (let i = 0; i < 7; i++) {
        const headerDate = new Date(currentDate);
        headerDate.setDate(currentDate.getDate() + i);
        tableHeaders[i + 1].textContent = `${headerDate.getMonth() + 1}/${headerDate.getDate()}(${daysOfWeek[headerDate.getDay()]})`;

        for (let j = 0; j < timeSlots.length; j++) {
            if (i === 0) { // 只在第一列添加時間行
                const row = document.createElement("tr");
                const timeCell = document.createElement("td");
                timeCell.textContent = timeSlots[j];
                row.appendChild(timeCell);
                tableBody.appendChild(row);
            }

            const cell = document.createElement("td");
            cell.classList.add("bg-light");
            cell.dataset.dateIndex = i;
            cell.dataset.timeIndex = j;

            const cellDate = new Date(headerDate);
            const cellDateString = formatDate(cellDate);
            cell.dataset.date = cellDateString;

            cell.addEventListener('click', handleCellClick);
            tableBody.rows[j].appendChild(cell); // 將新單元格添加到對應的行
        }
    }
}

function handleCellClick(event) {
    const cell = event.target;
    const selectedDate = cell.dataset.date;
    const timeIndex = cell.dataset.timeIndex;
    const selectedTime = timeSlots[timeIndex];

    console.log(`selectedDate: ${ selectedDate } / selectedTime: ${ selectedTime }`);

    // 檢查這個時間段是否已被當前用戶預約
    const bookingIndex = bookings.findIndex(booking =>
        booking.bookingDate === selectedDate &&
        booking.bookingTime === selectedTime &&
        booking.bookingId === userid &&
        booking.bookingfacilityId === factilityid);

    if (cell.classList.contains("disabled")) {
        showMessage('The time has been resverated from other user','error')
        return;
    }

    if (bookingIndex !== -1) {
        // 取消預約
        updateCellStatus(cell, 'available');
        cancelBooking(selectedDate, selectedTime, factilityid);
    } else {
        // 新增預約
        updateCellStatus(cell, 'bookedByUser');
        addBooking(selectedDate, selectedTime, factilityid);
    }
}

function cancelBooking(selectedDate, selectedTime, factilityid) {
    const bookingData = {
        bookingDate: selectedDate + 'T00:00:00',
        bookingTime: selectedTime + ':00',
        facilityId: factilityid,
    };
    
    const token = getCookie('token');
    fetch('https://localhost:7204/api/BookingsApi/DeleteBooking', {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
    })
        .then(data => {
            console.log(data);
            showMessage('Booking Deleted successfully','success')
            updateCalendar();
            fetchBookings();
            fetchUserBookings();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function addBooking(selectedDate, selectedTime, factilityid) {
    const bookingData = {
        bookingDate: selectedDate + 'T00:00:00',
        bookingTime: selectedTime + ':00',
        facilityId: factilityid,
        status: 'Confirmed'
    };

    console.log(JSON.stringify(bookingData));
    const token = getCookie('token');
    fetch('https://localhost:7204/api/BookingsApi/AddBooking', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
    })

        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    showMessage('Please log in to continue', 'Error');
                } else {
                    showMessage('Booking failed due to an error', 'Error');
                }
            }
        })
        .then(data => {
            showMessage('Booking created successfully','success')
            updateCalendar();
            fetchBookings();
            fetchUserBookings();
        })
        .catch(error => {
            console.error('Error:', error);
            updateCalendar();
            fetchBookings();
        });

}

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是從 0 開始的
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// 獲取特定日期
function getDateForCell(cellDateIndex) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + currentWeekIndex * 7 + cellDateIndex);
    // 使用本地時區而不是UTC
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // 月份是從 0 開始的
    const day = String(currentDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function fetchBookings() {
    const token = getCookie('token');
    //console.log(token);
    fetch('https://localhost:7204/api/BookingsApi/AllBookings', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            bookings = data.map(booking => {
                return {
                    ...booking,
                    bookingDate: booking.bookingDate.split('T')[0],
                    bookingTime: formatBookingTime(booking.bookingTime),
                    bookingId: booking.userId,
                    bookingfacilityId: booking.facilityId
                };
            });
            updateBookingsOnCalendar();
            console.log("資料庫所有預定資料", bookings)
            console.log("-------------------------------")
        })
        .catch(error => console.error('Error:', error));
}

// 正規化時間 08:00 --> 8:00
function formatBookingTime(time) {
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes}`;
}

// 判斷日期、時間是否相等，用userid判斷格子顏色
function updateBookingsOnCalendar() {
    bookings.forEach(booking => {
        const bookingDate = booking.bookingDate;
        const bookingTime = booking.bookingTime;
        const bookingId = booking.bookingId;
        const bookingfacilityId = booking.bookingfacilityId;

        if (bookingfacilityId === factilityid) {
            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                const cellDate = getDateForCell(dayIndex);

                if (bookingDate === cellDate) {
                    for (let timeIndex = 0; timeIndex < timeSlots.length; timeIndex++) {
                        const cell = document.querySelector(`.table td[data-date-index="${dayIndex}"][data-time-index="${timeIndex}"]`);
                        const cellTime = timeSlots[timeIndex];

                        if (bookingTime === cellTime) {
                            if (bookingId === userid) {
                                updateCellStatus(cell, 'bookedByUser');
                            } else {
                                updateCellStatus(cell, 'bookedByOthers');
                            }
                            break;
                        }
                    }
                }
            }
        }
    });
}

// 更新時間格的顏色和狀態
function updateCellStatus(cell, status) {
    // 移除所有可能的顏色類別
    cell.classList.remove("bg-light", "bg-success", "bg-danger", "disabled");

    // 根據傳入的狀態設定相應的類別
    switch (status) {
        case 'available':
            cell.classList.add("bg-light");
            break;
        case 'bookedByUser':
            cell.classList.add("bg-success");
            break;
        case 'bookedByOthers':
            cell.classList.add("bg-danger", "disabled");
            break;
    }
}


// 拿取token
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// 從Cookie的到token，萃取payload裡面的userid
function getUserIdFromToken() {
    const token = getCookie('token');
    const jwtParts = token.split(".");
    const header = JSON.parse(atob(jwtParts[0]));
    const payload = JSON.parse(atob(jwtParts[1]));
    const sub = payload.Sub;
    const sub1 = Number(sub);
    userid = sub1;
    console.log("目前登錄的的userid:", userid);
}

function getfacilityId() {
    // 從 URL 中獲取 facilityId
    const queryParams = new URLSearchParams(window.location.search);
    const facility = queryParams.get('facilityId');
    const facilityId = Number(facility);

    if (facilityId) {
        factilityid = facilityId
        console.log("目前設施的factilityid:", factilityid);
    } else {
        console.log('No Facility ID provided in URL');
        // 處理沒有提供 facilityId 的情況
    }
}

// 顯示使用者的訂閱
function fetchUserBookings(page = 1) {
    const token = getCookie('token');
    const pageSize = 10; // 頁數
    fetch('https://localhost:7204/api/BookingsApi/Bookings', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            const totalItems = data.length;
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedItems = data.slice(startIndex, endIndex);

            let bookingsHtml = '';
            paginatedItems.forEach((booking, index) => {
                const bookingDate = booking.bookingDate.split('T')[0];
                const bookingTime = formatBookingTime(booking.bookingTime);
                const bookingDateTime = `${bookingDate}T${bookingTime}:00`;
                const bookingDateTimeiso = new Date(bookingDateTime);
                const now = new Date();
                const isExpired = bookingDateTimeiso < now;
                const statusText = isExpired ? "已過期" : "未過期";

                bookingsHtml += `
            <tr>
                <th scope="row">${startIndex + index + 1}</th>
                <td>${booking.name}</td>
                <td>${bookingDate} ${bookingTime}</td>
                <td>${statusText}</td>
            </tr>
        `;
            });

            document.querySelector('#userRent tbody').innerHTML = bookingsHtml;
            updatePaginator(totalItems, pageSize, page);
        })
        .catch(error => console.error('Error:', error));
}

function updatePaginator(totalItems, pageSize, currentPage) {
    const totalPages = Math.ceil(totalItems / pageSize);
    let paginatorHtml = '<li class="page-item ' + (currentPage === 1 ? 'disabled' : '') + '"><a class="page-link"  onclick="fetchUserBookings(' + (currentPage - 1) + ')">Pre</a></li>';

    for (let i = 1; i <= totalPages; i++) {
        paginatorHtml += `<li class="page-item ${currentPage === i ? 'active' : ''}"><a class="page-link"  onclick="fetchUserBookings(${i})">${i}</a></li>`;
    }

    paginatorHtml += '<li class="page-item ' + (currentPage === totalPages ? 'disabled' : '') + '"><a class="page-link"  onclick="fetchUserBookings(' + (currentPage + 1) + ')">Next</a></li>';

    document.querySelector('#pagination').innerHTML = paginatorHtml;
}



function initializeEventListeners() {
    // 上一周
    document.getElementById("prevWeek").addEventListener("click", () => {
        currentWeekIndex--;
        updateCalendar();
        fetchBookings();
    });

    // 下一周
    document.getElementById("nextWeek").addEventListener("click", () => {
        currentWeekIndex++;
        updateCalendar();
        fetchBookings();
    });

    //初始化
    document.addEventListener("DOMContentLoaded", () => {
        updateCalendar();
        fetchBookings();
        getfacilityId();
        getUserIdFromToken();
        fetchUserBookings();
        loadFacilities();
    });
}

initializeEventListeners();