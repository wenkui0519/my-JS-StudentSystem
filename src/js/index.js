//变量
var tbody = document.getElementById('tbody');
var editForm = document.getElementById('studnet-edit-form');
var prevBtn = document.getElementsByClassName('prev')[0];
var nextBtn = document.getElementsByClassName('next')[0];

var curData = [];//当前数据
var curPage = 1;//当前页数
var curPageSize = 2;//每页显示数量
var totalPage = 1;//总页数

//封装类名切换方法
function changeActive(dom,targetActive,target){
    for(var i = 0;i<dom.length;i++){
        dom[i].classList.remove(targetActive);
    }
    target.classList.add(targetActive);
}

//数据获取 
function receiveData(){
    var response = saveData('https://open.duyiedu.com/api/student/findByPage',{
        appkey:'wenkui_0519_1572502212858',
        page: curPage,
        size: curPageSize
    })
    if(response.status == 'fail'){
        alert(response.msg)
    }else{
        console.log(response);
        curData = response.data.findByPage;
        randerData(curData);
        totalPage = ( response.data.cont / curPageSize );
        randerPage();
    }
}
receiveData();

//数据渲染
function randerData(data){
    var str = '';
    data.forEach(function(ele,index){
        str += `<tr>
            <td>${ele.sNo}</td>
            <td>${ele.name}</td>
            <td>${ele.sex == '0' ? '男' : '女' }</td>
            <td>${ele.email}</td>
            <td>${ele.birth = new Date().getFullYear() - ele.birth}</td>
            <td>${ele.phone}</td>
            <td>${ele.address}</td>
            <td>
                <button class="btn edit" data-index="${index}">编辑</button>
                <button class="btn delete" data-index="${index}">删除</button>
            </td>
        </tr>`
        tbody.innerHTML = str;
    })
}

//获取add表格数据
function getData(form){
    var sNo = form.sNo.value;
    var name = form.name.value;
    var sex = form.sex.value;
    var email = form.email.value;
    var birth = form.birth.value;
    var phone = form.phone.value;
    var address = form.address.value;

    var obj = {
        sNo,name,sex,email,birth,phone,address
    }

    if(!sNo || !name || !sex || !email || !birth || !phone || !address){
        return '信息不能为空';
    }
    return obj;
}

//edit数据渲染
function randerEdit(data){
    for(prop in data){
        if(editForm[prop]){
            editForm[prop].value = data[prop];
        }
    }
}

//翻页功能
function randerPage(){
    if(curPage > 1){
        prevBtn.style.display = 'inline-block';
    }else{
        prevBtn.style.display = 'none';
    }
    if(curPage < totalPage){
        nextBtn.style.display = 'inline-block';
    }else{
        nextBtn.style.display = 'none';
    }
}


//事件
function bindEvent(){
    var  menuList = document.getElementsByClassName('menu-list')[0];
    //类名切换
    menuList.onclick = function(e){
        if(e.target.tagName == 'DD'){
            var active = document.getElementsByClassName('active');
            changeActive(active,'active',e.target);

            var contentActive = document.getElementsByClassName('content-active');
            var id = e.target.getAttribute('data-id');
            var target = document.getElementById(id);
            changeActive(contentActive,'content-active',target);
        }
    }

    var form = document.getElementById("studnet-add-form");
    var studentList = menuList.getElementsByTagName('dd')[0];
    var studentAddBtn = document.getElementById('student-add-btn');
    //数据添加
    studentAddBtn.onclick = function(e){
        e.preventDefault();
        var data = getData(form)
        if(typeof data === 'object'){
            var response = saveData('https://open.duyiedu.com/api/student/addStudent',{
                appkey:'wenkui_0519_1572502212858',
                sNo: data.sNo,
                name: data.name,
                sex: data.sex == 'male' ? 0 : 1,
                birth: data.birth,
                phone: data.phone,
                address: data.address,
                email: data.email
            })
            if(response.status == 'success'){
                alert('添加成功');
                form.reset();
                studentList.click();
                receiveData();
            }else{
                alert(response.msg);
            }
        }else{
            alert(data);
        }
    }

    var modal = document.getElementsByClassName('modal')[0];
    //删除修改
    tbody.onclick = function(e){//contains
        var classList = e.target.classList;
        var index = e.target.dataset.index;
        if(e.target.tagName == 'BUTTON'){
            if(classList.contains('edit')){
                modal.style.display = 'block';
                randerEdit(curData[index]);
            }else if(classList.contains('delete')){
                var isDelet = window.confirm('确认删除？');
                if(isDelet){
                    var response = saveData('https://open.duyiedu.com/api/student/delBySno',{
                        appkey:'wenkui_0519_1572502212858',
                        sNo: curData[index].sNo
                    })
                    if(response.status == 'success'){
                        alert('删除成功');
                        receiveData();
                    }else{
                        alert(response.msg);
                    }
                }            
            }
        }
    }

    var mask = document.getElementsByClassName('mask')[0];
    //点击editform消失
    mask.onclick = function(){
        modal.style.display = 'none';
    }

    var editBtn = document.getElementById('student-edit-btn');
    //修改保存
    editBtn.onclick = function(e){
        e.preventDefault()
        var data = getData(editForm);
        var response = saveData('https://open.duyiedu.com/api/student/updateStudent',Object.assign({
            appkey:'wenkui_0519_1572502212858',
        },data))
        if(response.status == 'fail'){
            alert(response.msg);
        }else{
            alert('修改成功');
            modal.style.display = 'none';
            receiveData();
        }
    }

    //翻页事件
    prevBtn.onclick = function(){
        curPage--;
        receiveData();
    }
    nextBtn.onclick = function(){
        curPage++;
        receiveData();
    }

    //input输入判断
    form.onclick =  function(e){

        var reg = /[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/;//邮箱
        var reg1 = /^[\u4e00-\u9fa5]{2,6}$/;//名字
        var reg2 = /^1[0-9]{10}/;

        if(e.target.tagName == 'INPUT'){
            var self = e.target;
            // var str = self.value;
            self.onblur = function(){
                // if(self.id == 'email'){
                //     if(!reg.test(self.value)){
                //         iemail.style.backgroundColor = 'red';
                //     }else{
                //         iemail.style.backgroundColor = 'rosybrown';
                //     }
                // }
                self.id != 'email' ? '' : ( reg.test(self.value) ? iemail.style.backgroundColor = 'rosybrown' : iemail.style.backgroundColor = 'red' ) ;
                self.id != 'name' ? '' : ( reg1.test(self.value) ? iname.style.backgroundColor = 'rosybrown' : iname.style.backgroundColor = 'red' ) ;
                self.id != 'phone' ? '' : ( reg2.test(self.value) ? iname.style.backgroundColor = 'rosybrown' : iname.style.backgroundColor = 'red' ) ;
                self.id != 'sNo' ? '' : ( self.value.length == '4' ? isNo.style.backgroundColor = 'rosybrown' : isNo.style.backgroundColor = 'red' ) ;
                self.id != 'birth' ? '' : ( self.value.length == '4' ? ibirth.style.backgroundColor = 'rosybrown' : ibirth.style.backgroundColor = 'red' ) ;
            }
        }
    }
    editForm.onclick =  function(e){

        var reg = /[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/;//邮箱
        var reg1 = /^[\u4e00-\u9fa5]{2,6}$/;//名字
        var reg2 = /^1[0-9]{10}/;

        if(e.target.tagName == 'INPUT'){
            var self = e.target;
            self.onblur = function(){
                self.id != 'edit-email' ? '' : ( reg.test(self.value) ? editiemail.style.backgroundColor = 'rosybrown' : editiemail.style.backgroundColor = 'red' ) ;
                self.id != 'edit-name' ? '' : ( reg1.test(self.value) ? editiname.style.backgroundColor = 'rosybrown' : editiname.style.backgroundColor = 'red' ) ;
                self.id != 'edit-phone' ? '' : ( reg2.test(self.value) ? editiname.style.backgroundColor = 'rosybrown' : editiname.style.backgroundColor = 'red' ) ;
                self.id != 'edit-birth' ? '' : ( self.value.length == '4' ? editibirth.style.backgroundColor = 'rosybrown' : editibirth.style.backgroundColor = 'red' ) ;
            }
        }
    }
}
bindEvent()

// 数据交互  url: 接口地址  param： 请求参数
function saveData(url, param) {
    var result = null;
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    if (typeof param == 'string') {
        xhr.open('GET', url + '?' + param, false);
    } else if (typeof param == 'object'){
        var str = "";
        for (var prop in param) {
            str += prop + '=' + param[prop] + '&';
        }
        xhr.open('GET', url + '?' + str, false);
    } else {
        xhr.open('GET', url + '?' + param.toString(), false);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                result = JSON.parse(xhr.responseText);
            }
        }
    }
    xhr.send();
    return result;
}
//dataset 获取data-的值  object.assign