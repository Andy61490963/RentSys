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
            const container = document.getElementById('FacilityContainer');
            container.innerHTML = ''; // 清空容器以便新增新的卡片

            data.forEach(facility => {
                const facilityHtml = `
                    <div class="col-lg-6 p-3">
                      <div class="card shadow-lg border-0 custom-rounded">
                        <div class="row g-0">
                          <div class="col-lg-8">
                            <img src="${facility.imageUrl}" alt="場地圖片" class="img-fluid custom-rounded h-100 p-2" />
                          </div>
                          <div class="col-lg-4 d-flex flex-column">
                            <div class="card-body bg-light">
                              <h5 class="card-title text-success fw-bold">${facility.name}</h5>
                              <p class="card-text">${facility.location}</p>
                              <p class="card-text text-muted">${facility.description}</p>
                              <p class="card-text text-muted">面積: ${facility.area} 平方米</p>
                            </div>
                            <div class="mt-auto p-2">
                              <button type="button" class="btn btn-primary w-100" onclick="createBooking(${facility.id})">預訂場地</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>`;
                container.innerHTML += facilityHtml;
            });
        })
        .catch(error => console.error('Error:', error));
}

// 提取 Cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
function createBooking(facilityId) {
    const token = getCookie('token');
    if (!token) {
        const message = 'Please <a href="/AuthBtn/Login" style="color: blue; text-decoration: underline;">log in</a> to continue';
        showMessage(message, 'Error');
        return;
    }
    // 跳轉到創建預約的頁面，並帶上 facilityId 作為查詢參數
    window.location.href = `RentDetail?facilityId=${facilityId}`;

}
window.onload = loadFacilities;