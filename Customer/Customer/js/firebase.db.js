// import { initializeApp } from '../../node_modules/@firebase/app';

// import { getFirestore, collection, getDocs } from '../../node_modules/@firebase/firestore/lite';
// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

// TODO: Replace the following with your app's Firebase project configuration

var firebaseAPI = 'http://159.223.100.199:8083/';

var selectedTopings = [];
var selectedMeats = [];
var calendar;

// Get a list of cities from your database
async function getUsers(db) {
  const citiesCol = collection(db, 'USERS');
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map(doc => doc.data());
  return cityList;
}

function showLoader() {
  $('#loader').show();
  $('body').css('opacity', '0.3');
}

function hideLoader() {
  $('#loader').hide();
  $('body').css('opacity', 1);
}

function logout() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem("displayname");
  sessionStorage.removeItem("currentUser");
  // sessionStorage.removeItem("currentFood");
  // $('div#navLogin').css('display','block');
  // $('div#currentUserSection').css('display','none');
  const auth = getAuth(firebaseApp);
  showLoader();
  signOut(auth).then(() => {
    $('div#navLogin').css('display', 'block');
    $('div#currentUserSection').css('display', 'none');
    hideLoader();
  }).catch((error) => {
    $('div#navLogin').css('display', 'block');
    $('div#currentUserSection').css('display', 'none');
    hideLoader();
  });
  $('#adminNav').css('display', 'none');
}

$('#logout').on('click', function () {
  logout();
  pageReload();
});

function clearSignForm() {
  $('#email').val('');
  $('#password').val('')
}

$('#loader').hide();
let dpName = sessionStorage.getItem("displayname");
if (dpName && dpName.trim() == 'admin') {
  $('#adminNav').css('display', 'block');
} else {
  if (location.href.indexOf('admin') >= 0) {

    location.href = "/Customer"
  }

  $('#adminNav').css('display', 'none');
}
function pageReload() {
  if (window.location.href.indexOf('customize') == -1) {
    window.location.reload();
  }
}
function signin(email, pwd){
  const auth = getAuth(firebaseApp);
  signInWithEmailAndPassword(auth, email, pwd)
    .then(async (userCredential) => {
      const user = userCredential.user;

      let userDetails  = await getDoc(doc(firbasedb, "USERS", user.uid));

      let udata = userDetails.data();
      // Signed in 
      sessionStorage.setItem('token', user.accessToken);
    let dpName ='';
      if(udata.fname){
        dpName = udata.fname;
      }

      if(udata.lname){
        dpName = dpName + ' ' +udata.lname;
      }
      sessionStorage.setItem("displayname", dpName);
      sessionStorage.setItem('currentUser', JSON.stringify(auth.currentUser))
      if (user.accessToken && dpName) {
        $('div#navLogin').css('display', 'none');
        $('div#currentUserSection').css('display', 'block');
        $('#currentUser').html(dpName);
       
      }
      if ((dpName).trim() == 'admin') {
        $('#adminNav').css('display', 'block');
      }
      clearSignForm();
      $("#BookingModalSignin").modal('hide');
      console.log(user);
      hideLoader();
      pageReload();
      // ...
    })
    .catch((error) => {
      $('div#navLogin').css('display', 'block');
      $('div#currentUserSection').css('display', 'none');
      hideLoader();
      if (error.code == 'auth/user-not-found') {
        console.log("User not found");
        alert('User not found please signup !');
        return;
      }
      alert('Something wrong with user login please try again !');
      const errorCode = error.code;
      const errorMessage = error.message;
    });
}
$('#signIn').on('click', function () {
  showLoader();
  const auth = getAuth(firebaseApp);
  signin($('#email').val(), $('#password').val());
});

function clearSignupForm() {
  $('#fname').val('');
  $('#sphone').val('');

  $('#spassowrd').val('');
  $('#scpassowrd').val('');
  $('#semail').val('');

}

$('#signup').on('click', function () {
  const auth = getAuth(firebaseApp);
  let fname = $('#fname').val();
  let lname = $('#lname').val();
  let sphone = $('#sphone').val();
  // let peopleCount = $('#peopleCount').val();
  // let dateBirth = $('#dateBirth').val();
  // let stime = $('#stime').val();
  let spassowrd = $('#spassowrd').val();
  let scpassowrd = $('#scpassowrd').val();
  let semail = $('#semail').val();


  if (scpassowrd !== scpassowrd) {
    console.log("Password and confirm password missmatch");
    return;
  }
  showLoader();
  createUserWithEmailAndPassword(auth, semail, spassowrd)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      updateProfile(user, {
        displayName: fname +' '+ lname,
        photoURL: "",
        phoneNumber: sphone

      }).then(async () => {

        await setDoc(doc(firbasedb, "USERS", user.uid), {
          phoneNumber: sphone,
          lname:lname,
          fname: fname,
          email: semail

        });

        hideLoader();
        // Profile updated!
        $('#infoMsg').html("User created successfully! Please login");
        clearSignupForm();

        signin(semail, spassowrd);
        // ...
      }).catch((error) => {
        hideLoader();
        alert('Something wrong with user registration please try again !');
        // An error occurred
        // ...
      });

      // ...
    })
    .catch((error) => {
      hideLoader();
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });
});

function clearOrderForm() {
  $('#nameOnCard').val('');
  $('#cardNumber').val('');
  $('#cardEmail').val('');
  $('#billAddress').val('');
}
$('#orderProceed').on('click', async function () {
  let cardName = $('#nameOnCard').val();
  let cardNumber = $('#cardNumber').val();
  let email = $('#cardEmail').val();
  let billingAddres = $('#billAddress').val();

  if (!$('#cashpaymet').is(':checked') && (!cardName || !cardNumber)) {
    return;
  }
  showLoader();

  const cuser = getCurrentUser();
  if (cuser) {
    const docRef = doc(firbasedb, "cart", cuser.uid);
    const docSnap = await getDoc(docRef);
    let docData = docSnap.data();
    const orderItems = doc(firbasedb, "Orders", cuser.uid);
    const orderDocsnap = await getDoc(orderItems);
    let orders = orderDocsnap.data();
    if (!orders) {
      orders = {}
    }
    if (!orders.items) {
      orders.items = [];
    }

    if(orders.items.length){
      orders.items.map(itm=>{
        if(!itm.orderPlacingTime){
          itm.orderPlacingTime =   new Date().toISOString();
        }
    return itm;
  });
    }
    if(docData.items && docData.items.length){
      docData.items.map(itm=>{
            itm.orderPlacingTime =   new Date().toISOString();
        return itm;
      });
    }
    setDoc(orderItems, {
      items: orders.items.concat(docData.items),
      cardInfo: {
        cardName: cardName,
        cardNumber: cardNumber,
        email: email,
        billingAddres: billingAddres,
        cname: cuser.displayName,
        cemail: cuser.email,
        uid: cuser.uid
      }
    });
    const cartItems = doc(firbasedb, "cart", cuser.uid);
    setDoc(cartItems, {
      items: []
    });
    $('#orderSuccess').show();
    clearOrderForm();

  }

  hideLoader();

});
function getCurrentUser() {
  let currentUser = sessionStorage.getItem('currentUser');
  return JSON.parse(currentUser);
}

window.writeReview = function(wrap){
  $('#reviewwriteText').val('');
  $('#wrapnameItem').html(wrap);
  $('#reviewModal').modal('show');
 
}

$('#reveiwwwrite').on('click', function(){
      let wrap = $('#wrapnameItem').html();
      let wrapText =  $('#reviewwriteText').val();
      let user = getCurrentUser();

      showLoader();
      fetch(firebaseAPI + 'writeReview?email=' + user.email + '&wrap=' + wrap + '&writereview=' + wrapText).then(response => response.text()).then(data => {
        $('#reviewwriteText').val("")
        hideLoader();
        alert("Your review submitted!");
      });
});

function renderCart(docData, page) {
  let trows = '';
  let totalPrice = 0;
  window.deleteClick = function (item) {
    console.log(item);
  }

  // docData.items.map((row, index) => {

  //   if (row.selectedTopings && row.selectedTopings.length) {
  //     row.topings.map((top, index)=>{

  //     let currentTopingData =  getToppingData(top);
  //     if(currentTopingData){
  
  //       currentTopingData.topping = top;
  //       currentTopingData.id = index + 1;
  //       return currentTopingData;
  //     }


  //     });

  //   }

  // });
  docData.items.map((row, index) => {
    let totalPriceWithToping = 0;
    if (row.selectedTopings && row.selectedTopings.length) {
     
     
      totalPriceWithToping = row.selectedTopings.reduce((acc, curr, index) => {
        return acc + (+curr.basePrice);
      }, 0);


    }

    if (row.selectedMeats && row.selectedMeats.length) {
     
     
      totalPriceWithToping += row.selectedMeats.reduce((acc, curr, index) => {
        return acc + (+curr.price);
      }, 0);


    }




    trows += `<tr>
    <td>${row.name}</td>
    <td>$ ${row.basePrice + totalPriceWithToping}</td>
    `;
    if (page == 'myorders') {
      trows += `
      <td>${row.quantity}</td>
      <td>${row.status ? row.status : 'Pending'}</td>
      <td>${row.orderTime ? row.orderTime : ''}</td>`;
    } else {
      trows += `<td><input type="text" id="quanity${index}" value="${row.quantity}" /></td>`;
    }
    trows += `
    <td> $ ${Math.round(+row.quantity * (row.basePrice + totalPriceWithToping)*5)/100 }</td>
    <td id="subtotal${index}">$${ (+row.quantity * (row.basePrice + totalPriceWithToping)) + Math.round(+row.quantity * (row.basePrice + totalPriceWithToping)*5)/100 }</td>`;
    if (!page) {
      trows += `
      
      <td><button  id="delete${index}">Delete</button></td>`;
    }
    if (page == 'myorders') {
      trows += `<td> <span class="write-review" onclick="writeReview('${row.name}')"> Write Review </span> </td></tr>`
    }else{
      trows += '</tr>'
    }
    totalPrice += (+row.quantity) * (row.basePrice + totalPriceWithToping);
    return row;
  });

  return { trows, totalPrice };
}

function lastweekDates(eventsOnDateWise){
  var lastweekdates = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0];
    });

let lastWeekOrderAmount = 0;
let lastWeekMeatRevenue =0;
let months = moment.monthsShort();
let optionEle = '';
for(let j=0;j< months.length; j++){
  optionEle += `<option value="${months[j]}">${months[j]}</option>`;
}

let yearEle = '';
for(let u=new Date().getFullYear()-4; u<= new Date().getFullYear(); u++){
  yearEle += `<option ${new Date().getFullYear() ==u ? 'selected':''} value="${u}">${u}</option>`;
}
$('#revenuYear').html(yearEle);
$('#revenueMeatYear').html(yearEle);
$('#monthOptions').html(optionEle);
$('#monthMeatOptions').html(optionEle);

for(let prop in eventsOnDateWise){
  if(lastweekdates.includes(prop)){
    let orders = eventsOnDateWise[prop];

    lastWeekOrderAmount +=  orders.reduce((acc, curr) => {
     let basePrice = +curr.basePrice;
     let topingPrc = 0;
     let meatPrc=0;
     if(curr.selectedTopings){
      topingPrc = curr.selectedTopings.reduce((a,c)=>{
        return a + +c.basePrice;
      },0);
     }

     if(curr.selectedMeats){
      meatPrc = curr.selectedMeats.reduce((a,c)=>{
        return a + +c.price;
      },0);
      lastWeekMeatRevenue += meatPrc;
     }

     return acc+  (+curr.quantity * (basePrice+topingPrc+meatPrc));

    },0);

  }

}
$('#lastWeekRevenue').html('$'+lastWeekOrderAmount);
$('#lastWeekMeatRevenue').html('$'+lastWeekMeatRevenue);


}

function montnthWiseMeatRevenue(event){
  let year = $('#revenueMeatYear').val();
  let month = $('#monthMeatOptions').val();
  let monthlyRevenue = 0;
  let monthMeatRevenue = 0;
  if(!this || !this[year] || !this[year][month]){
    $('#monthsMeatRevenue').html('$'+monthlyRevenue);

    return;
  }

  let selectedYearMonth = this[year][month];

  for(let itm=0; itm<selectedYearMonth.length; itm++) {
      let curr = selectedYearMonth[itm];
       if(curr.selectedMeats){
        meatPrc = curr.selectedMeats.reduce((a,c)=>{
          return a + +c.price;
        },0);
          monthMeatRevenue += meatPrc;
      }

  }
  $('#monthsMeatRevenue').html('$'+monthMeatRevenue);


}

function montnthWiseRevenue(event){
  let year = $('#revenuYear').val();
  let month = $('#monthOptions').val();
  let monthlyRevenue = 0;

  if(!this || !this[year] || !this[year][month]){
    $('#monthRevenue').html('$'+monthlyRevenue);

    return;
  }
  
  let selectedYearMonth = this[year][month];
  

  for(let itm=0; itm<selectedYearMonth.length; itm++) {
    let curr = selectedYearMonth[itm];

    // monthlyRevenue +=  item.reduce((acc, curr) => {
      let basePrice = +curr.basePrice || 0;
      let topingPrc = 0;
      let meatPrc=0;
      if(curr.selectedTopings){
       topingPrc = curr.selectedTopings.reduce((a,c)=>{
         return a + +c.basePrice;
       },0);
      }
 
      if(curr.selectedMeats){
       meatPrc = curr.selectedMeats.reduce((a,c)=>{
         return a + +c.price;
       },0);
      //  lastWeekMeatRevenue += meatPrc;
      }
 
      monthlyRevenue +=  (+curr.quantity * (basePrice+topingPrc+meatPrc));
 
    //  },0);

    }
    $('#monthRevenue').html('$'+monthlyRevenue);



}

function calnederOrder(type){
  if(calendar){
    calendar.destroy();
  }
  listOfAdminOrders(type);
}

async function listOfAdminOrders(type){
 let adminOrders = collection(firbasedb, 'Orders');
 let adminOrdersSnapshot = await getDocs(adminOrders);
 let  adminOrdersList = adminOrdersSnapshot.docs.map(doc => doc.data());
 let calendarEvent = [];
 let eventsOnDateWise = {

 };
 let yearData ={};
 let ordersItemWise = {};
 let meatOrders = {};
 let meatOrdersCategory = {};
  if(adminOrdersList && adminOrdersList.length){
    adminOrdersList.map(order=>{
           order.items.map(item=>{
            let formatedDate ;
            if(item.orderPlacingTime){
              let dt = new Date(item.orderPlacingTime);
              let day = dt.getDate()+'';
              day = day.length >1 ? day:'0'+day;
              let month = (+dt.getMonth()+1) +'';
              month = month.length>1 ? (month): '0'+ ( month);
               formatedDate = dt.getFullYear()+'-'+ month +'-'+ day;
              
              if(ordersItemWise[formatedDate +':'+ item.name]){
                ordersItemWise[formatedDate +':'+ item.name] = ordersItemWise[formatedDate +':'+ item.name]+1
              }else {
                ordersItemWise[formatedDate+':'+ item.name] = 1
              }

              if(item.selectedMeats && item.selectedMeats.length && meatOrders[formatedDate]){
                meatOrders[formatedDate] = meatOrders[formatedDate] +1;
              }else if(item.selectedMeats && item.selectedMeats.length){
                meatOrders[formatedDate] =1;
              }

              if(item.selectedMeats && item.selectedMeats.length){
                item.selectedMeats.map(itm=>{
                     if(meatOrdersCategory[formatedDate+':'+itm.item]){
                      meatOrdersCategory[formatedDate+':'+itm.item] = meatOrdersCategory[formatedDate + ':'+itm.item] +1;
                     }else{
                      meatOrdersCategory[formatedDate+':'+itm.item] = 1;
                     }
               

                });
              }
       
            }
            if(item.orderPlacingTime){
            let dt = new Date(item.orderPlacingTime);
            let month = (+dt.getMonth()+1) +'';
            month = month.length>1 ? (month): '0'+ ( month);
            let shortMonth = moment(month, 'M').format('MMM');
            if(!yearData[dt.getFullYear()]){
              yearData[dt.getFullYear()]  ={};
              yearData[dt.getFullYear()][shortMonth] =[item];
            }
             else if(yearData[dt.getFullYear()]){
              if(!yearData[dt.getFullYear()][shortMonth]){
                yearData[dt.getFullYear()][shortMonth] =[item];
              }else if(yearData[dt.getFullYear()][shortMonth]){
                yearData[dt.getFullYear()][shortMonth].push(item);
              }
            }
          }

            if(formatedDate && item.orderPlacingTime && !eventsOnDateWise[formatedDate]){
      
              eventsOnDateWise[formatedDate] = [item];
            }else if(item.orderPlacingTime && eventsOnDateWise[formatedDate]){
              eventsOnDateWise[formatedDate].push(item);
            }
           });
    });

    lastweekDates(eventsOnDateWise);
    $('#revenuYear').on('change', montnthWiseRevenue.bind(yearData));
    $('#monthOptions').on('change', montnthWiseRevenue.bind(yearData));
    $('#revenueMeatYear').on('change', montnthWiseMeatRevenue.bind(yearData));
    $('#monthMeatOptions').on('change', montnthWiseMeatRevenue.bind(yearData));
    
    // montnthWiseRevenue(yearData);
    $('#revenuYear').trigger('change');
  }

  if(!type || type =='all' || type == 'totalOrders'){


  for(let prop in eventsOnDateWise){
    calendarEvent.push({
      id:prop,
      title: "Total Orders: "+ eventsOnDateWise[prop].length,
      start: prop
    });
  }

}

if(!type || type =='all' || type == 'itemwise'){
  for(let prop in ordersItemWise){
    let itemSplit = prop.split(":");
    calendarEvent.push({
      // id:itemSplit[1],
      title: itemSplit[1] +" : " + ordersItemWise[prop],
      start: itemSplit[0]
    });
  }

}


if(!type || type =='all' || type == 'meatorders'){
  for(let prop in meatOrdersCategory){
    let categ = prop.split(':');
    calendarEvent.push({
      // id:itemSplit[1],
      title: categ[1] +':'+ meatOrdersCategory[prop],
      start: categ[0]
    });
  }
  

}
 console.log(calendarEvent);
 if(typeof FullCalendar != 'undefined'){

   renderFullcalendar(calendarEvent);
 }

}
async function getCartItems(page, tblName) {
  const cuser = getCurrentUser();
  showLoader();
  if (cuser) {

    const docRef = doc(firbasedb, (tblName || "cart"), cuser.uid);
    const docSnap = await getDoc(docRef);
    let docData = docSnap.data();
    let trows = '';
    let totalPrice = 0;
    let adminOrders;
    let adminOrdersSnapshot;
    let adminOrdersList;
    if(tblName){
       adminOrders = collection(firbasedb, tblName);
       adminOrdersSnapshot = await getDocs(adminOrders);
       adminOrdersList = adminOrdersSnapshot.docs.map(doc => doc.data());
    }
   
    let copyOfAdminOrders = [];
    
    window.orderStatusChange = async function (thisDoc, index, orderIndex, noalert) {
      showLoader();
      let selectedOrderC = copyOfAdminOrders[index];
    //  let adminlist = adminOrdersList;
    let lsOrderInex;
     let lstOrder;
      for(let y=0; y<adminOrdersList.length; y++) {
        if(adminOrdersList[y].items && adminOrdersList[y].items.length){
          lstOrder= adminOrdersList[y].items.find(rt=>{
            // if(rt.orderId){
              return  (index+''+orderIndex+ adminOrdersList[y].cardInfo.uid) == selectedOrderC.orderId
            // }
            // if(rt.name){
            //   return  rt.name == selectedOrderC.name
            // }
          });
          if(lstOrder){
            lsOrderInex = y;
            break;
          }
        }

      }

      // if (selectedOrderC.items && selectedOrderC.items.length) {
        let orderSelected = selectedOrderC;
        orderSelected.status = lstOrder.status = typeof thisDoc != 'string' ? $(thisDoc).val(): thisDoc;
        if(orderSelected.status == 'Delivered'){
          orderSelected.orderTime = lstOrder.orderTime = 0;
        }
      // }
      // adminOrdersList.map(async (or, idex)=>{

      const orderItems = doc(firbasedb, "Orders", selectedOrderC.cardInfo.uid);
      // const orderDocsnap = await getDoc(orderItems);
      // let orders = orderDocsnap.data();
      // if(!orders){
      //   orders ={}
      // }
      // if(!orders.items){
      //   orders.items  =[];
      // }
      await setDoc(orderItems, {
        items: adminOrdersList[lsOrderInex].items,
        cardInfo: selectedOrderC.cardInfo
      });
      hideLoader();
      if(!noalert){
        alert(selectedOrderC.cardInfo.cname + " Order " + $(thisDoc).val());
      }

      // });
      // let selectedOrder = adminOrdersList[index];
    }
    async function updateTime(indx, index, value) {

      showLoader();
      // adminOrdersList[indx].items[index].orderTime = value;

      let lsOrderInex;
      let selectedOrderC = copyOfAdminOrders[indx];
      let lstOrder;
       for(let y=0; y<adminOrdersList.length; y++) {
         if(adminOrdersList[y].items && adminOrdersList[y].items.length){
           lstOrder= adminOrdersList[y].items.find(rt=>{
               return  (indx+''+index+ adminOrdersList[y].cardInfo.uid) == selectedOrderC.orderId
 
           });
           if(lstOrder){
             lsOrderInex = y;
             break;
           }
         }
 
       }
      lstOrder.orderTime = value;
      const orderItems = doc(firbasedb, "Orders", selectedOrderC.cardInfo.uid);

      await setDoc(orderItems, {
        items:adminOrdersList[lsOrderInex].items,
        cardInfo: selectedOrderC.cardInfo
      });
      hideLoader();

      // console.log(order, itm);
      console.log(adminOrdersList);

    }
    if (page == 'adminorders') {
     
      //  let use =   getAuth(firebaseApp)
      //.getUser(cuser.uid);
    window.adminOrderClick =  function adminOrderClick(thisOr, index, orderIndex){
   
      let order = copyOfAdminOrders[index];
      if (order) {
        let orderSelected = order;
        sessionStorage.setItem('currentFood', JSON.stringify(orderSelected));
        geCustomeItemsForFood();
        let reviews ='';
        fetch(firebaseAPI + 'getReview?wrap=' + orderSelected.name).then(response => response.json()).then(data => {
          console.log(data);
          let option = "";
           for(let prop in data){
            for(let i=0; i< data[prop].length; i++){

              reviews += `
              <div class="review">
               <span class="uname"> ${prop} : </span>
  
               <span class="rveiw-text">
               ${data[prop][i]}
               </span>
  
              </div>
              `;
            }
         

           }

           $("#reviewContainer").html(reviews);
        });

       $('#orderDetails').modal('show');

      }

      return;
        fetch(firebaseAPI+'getMenu?wrapname='+order).then(data=>{
       return  data.json()
        }).then(data=>{
          if(data){
            sessionStorage.setItem('currentFood', JSON.stringify(data));
            geCustomeItemsForFood();
           $('#orderDetails').modal('show');
            console.log(data);
          }
        },
        (er)=>{
          alert("Please contact admin, the selected order was deleted from menu list");
          console.log(er);
        });
      //  console.log(thisOr);
      }
      

      if (adminOrdersList) {
        // let copyOfAdminOrders = [];

        adminOrdersList.map(order=>{

          order.items.map(item=>{

            let newItem = JSON.parse(JSON.stringify(item));
            newItem.cardInfo = order.cardInfo;
            copyOfAdminOrders.push(newItem);

          });
        });

        let tr = '';
  
        let statsList = [
          { status: "Pending", id: 1 },
          { status: "Delivered", id: 2 },
          { status: "Accepted", id: 3 },
        ];
        let index = 10;
        copyOfAdminOrders.sort((a,b)=>{
          return new Date(b.orderPlacingTime) - new Date(a.orderPlacingTime);
        }).map((itm, indx) => {
          index++;
          let cardDetails = itm.cardInfo;
          // if (!itm.items) {
          //   or.items = [];
          // }
          let totalOderPrice = 0;
          //let totalPriceWithToping = 0;
          // or.items.map((itm, index) => {
            totalOderPrice = itm.basePrice;
            if(itm.selectedMeats && itm.selectedMeats.length){
              totalOderPrice += itm.selectedMeats.reduce((acc, curr, index) => {
                return acc + (+curr.price);
              }, 0);
            }

            if (itm.selectedTopings && itm.selectedTopings.length) {
     
     
              totalOderPrice += itm.selectedTopings.reduce((acc, curr, index) => {
                return acc + (+curr.basePrice);
              }, 0);
        
        
            }
           
      
            itm.orderId = `${indx}${index}${cardDetails.uid}`;
            // itm.timeToDeliver = 30;
            tr += `
              <tr>
              <td>${itm.orderId}</td>
              <td> <span style="color: #727cf5;
              cursor: pointer;" onclick="adminOrderClick(this, ${indx}, ${index})">${itm.name}</span></td>
              <td>${cardDetails.cname || cardDetails.cardName}</td>
              <td>${itm.quantity}</td>
              <td>$${ +itm.quantity * totalOderPrice + (Math.round(5* +itm.quantity * totalOderPrice)/100)}</td>`;

            let statustd = `<td><select onchange='orderStatusChange(this, ${indx}, ${index})' name="statuses" id="status-${index}">`;
            statsList.map(st => {
              if (!itm.status) {
                itm.status = 'Pending'
              }
              if (st.status == itm.status) {
                statustd += `<option selected value="${st.status}">${st.status} </option>`;
              } else {

                statustd += `<option value="${st.status}">${st.status} </option>`;
              }
            });

            statustd += `</select></td>
            <td><input type="text" value="${itm.orderTime || ''}"  id="orderTime-${indx}-${index}"/></td>
              <td>${cardDetails.cardNumber ? 'Card':'Cash'}</td>
              </tr>
            `;
            tr += statustd;
            return itm;
          // });
        });

        $('#adminOrders tbody').html(tr);

    

        setInterval(async () => {

          adminOrdersList.map((or, indx) => {
            or.items.map(async (itm, index) => {

              if(itm.orderTime && +itm.orderTime > 1 ){
                await updateTime(indx, index, (+itm.orderTime) - 1);
                pageReload();
              }else if(+itm.orderTime == 1){
              await  orderStatusChange('Delivered', indx, index, true);
                pageReload();
              }
             
              return itm;
            });
              return or;
          });
       
        }, 100000);
        adminOrdersList.map((or, indx) => {
          or.items.map((itm, index) => {
            index = index+11;
            $('#orderTime-' + indx + '-' + index).on('blur', async function (e) {
              //updateTime.bind({indx:this.indx, index:this.index});
              let selectedOrderC = adminOrdersList[this.indx];
              await updateTime(this.indx, this.index, e.currentTarget.value);
              alert(selectedOrderC.cardInfo.cname + " Order Time " + e.currentTarget.value + "Updated!");
             
            }.bind({
              index,
              indx
            }));
            return itm;
          });
        });

      }
    }
    else if (page == 'orders') {
      docData.items.map(row => {
        let totalPriceWithToping = 0;
        let totalPriceWithMeat = 0;
        if (row.selectedTopings && row.selectedTopings.length) {
          totalPriceWithToping = row.selectedTopings.reduce((acc, curr, index) => {
            return acc + (+curr.basePrice);
          }, 0);
        }
        if (row.selectedMeats && row.selectedMeats.length) {
          totalPriceWithMeat = row.selectedMeats.reduce((acc, curr, index) => {
            return acc + (+curr.price);
          }, 0);
        }
        trows += `
      <div class="d-flex mb-lg-1">
      <p>${row.name} </p>
      <p class="ms-5">$ ${(row.basePrice + totalPriceWithToping + totalPriceWithMeat) * +  +row.quantity} </p>
    </div>`
        totalPrice += +row.quantity * (row.basePrice + totalPriceWithToping + totalPriceWithMeat);
        return row;
      });

      $('#orderDetails').html(trows);
      var tPtri= +totalPrice  + (Math.round(5 * +totalPrice) / 100);
      $('#orderTotal').html('$ ' + tPtri);
    } else {
      if (!docData) {
        docData = {
          items: []
        };
      }

      if(page == 'myorders'){

        setInterval(async () => {

          adminOrdersList.map((or, indx) => {
            or.items.map(async (itm, index) => {

              if(itm.orderTime && +itm.orderTime > 1 ){
                await updateTime(indx, index, (+itm.orderTime) - 1);
                pageReload();
              }else if(+itm.orderTime == 1){
              await  orderStatusChange('Delivered', indx, index, true);
                pageReload();
              }
             
              return itm;
            });
              return or;
          });
       
        }, 100000);
      }

      $('#cartCheckoutProceed').on('click', async function (e) {
        const cartItems = doc(firbasedb, "cart", cuser.uid);
        await setDoc(cartItems, {
          items: docData.items
        });
        location.href = "Payment.html";
        // console.log(docData);
      });

      let obj = renderCart(docData, page);
      trows = obj.trows;
      totalPrice = obj.totalPrice;
      $('#customers_cart tbody').html(trows);
      var taxPrice  = Math.round(5 * +totalPrice) / 100;
      $('#taxPrice').html(taxPrice);
      $('#totalPrice').html(totalPrice + taxPrice);
      docData.items.map((el, index) => {
        $("#customers_cart tbody td").on('change', "#quanity" + index, (function (e, el) {
          let item = docData.items[this];
          item.quantity = e.currentTarget.value;
          let subtotalTopingPrice = 0;
          let subtotalMeatPrice = 0;
          if(item.selectedTopings && item.selectedTopings.length){
            subtotalTopingPrice = item.selectedTopings.reduce((acc, curr, index) => {
              return acc + (+curr.basePrice);
            }, 0);
          }

          if(item.selectedMeats && item.selectedMeats.length){
            subtotalMeatPrice = item.selectedMeats.reduce((acc, curr, index) => {
              return acc + (+curr.price);
            }, 0);
          }
          docData.items[this] = item;
          totalPrice = 0;
          $("#subtotal" + this).html('$' + +item.quantity * (item.basePrice + subtotalTopingPrice + subtotalMeatPrice));
          // let obj  = renderCart(docData, page);
          // trows = obj.trows;
          // totalPrice = obj.totalPrice;
          // $('#customers_cart tbody').html(trows);
          docData.items.map((el, ind) => {
            let totalPriceWithToping = 0;
            let totalMeatPrice = 0;
            if (el.selectedTopings && el.selectedTopings.length) {
              totalPriceWithToping = el.selectedTopings.reduce((acc, curr, index) => {
                return acc + (+curr.basePrice);
              }, 0);
            }
            if(el.selectedMeats && el.selectedMeats.length){
              totalMeatPrice = el.selectedMeats.reduce((acc, curr, index) => {
                return acc + (+curr.price);
              }, 0);
            }
            totalPrice += (+el.quantity) * (+el.basePrice + totalPriceWithToping + totalMeatPrice);

          });
          $('#totalPrice').html(totalPrice + taxPrice);
          // console.log(e, docData.items[this]);
        }).bind(index));

        $("#customers_cart tbody td").on('click', "#delete" + index, (async function (e, elm) {
          console.log(this);
          let item = docData.items[this];
          // item.quantity = e.currentTarget.value;
          docData.items = docData.items.filter(et => {
            return et.name != item.name;
          });
          const cartItems = doc(firbasedb, "cart", cuser.uid);
          await setDoc(cartItems, {
            items: docData.items
          });
          pageReload();
          console.log(docData.items);
        }).bind(index));
      });

      console.log(docSnap.data());
    }
  } else {

    setTimeout(() => {

      window.$("#BookingModalSignin").modal('show');
    }, 300);
    logout();
  }
  hideLoader();
  // const cartsCol = collection(firbasedb, 'cart');
  // const cartsSnapshot = await getDocs(cartsCol);
  // const cartsList = cartsSnapshot.docs.map(doc => doc.data());
  // return cartsList;
}


function logoutAndShowLogin() {
  setTimeout(() => {

    window.$("#BookingModalSignin").modal('show');
  }, 300);
  logout();
}
async function addToCart(thisDoc, wrap) {
  const cuser = getCurrentUser();
  showLoader();
  if (cuser) {
    const docRef = doc(firbasedb, "cart", cuser.uid);
    const docSnap = await getDoc(docRef);
    let datr = docSnap.data();
    const cartItems = doc(firbasedb, "cart", cuser.uid);
    if (datr) {
     let filterWrap = datr.items.filter(it=>{
         if(it.name == wrap.name){

           return true;
         }
      });
      if(filterWrap.length){
        await updateDoc(cartItems, {
          items: arrayRemove(filterWrap[0])
         });
      }
      await updateDoc(cartItems, {
        items: arrayUnion(wrap)
      });
    }
    else {
     
      await setDoc(cartItems, {
        items: arrayUnion(wrap)
      })
    }
    // await setDoc(doc(firbasedb, "cart", cuser.uid),  {
    //   id: id,
    //   name: name,
    //   price:price,
    //   quantity:1
    // });
    if (thisDoc) {
      $(thisDoc).hide();
      $('<button type="button"><i class="bi bi-cart-check"></i></button>').insertAfter($(thisDoc));

    }
  } else {
    logoutAndShowLogin();
  }
  hideLoader();
  // const docRef = await addDoc(collection(firbasedb, "cart"), {
  //   id: id,
  //   name: name,
  //   price:price,
  //   quantity:1
  // });
  console.log('cart added');
}

async function getToppingData(top){
  const toppings = doc(firbasedb, "Toppings", top);
  const docSnap = await getDoc(toppings);
  let currentTopingData = docSnap.data();
  return currentTopingData;
}

function prepareFood(thisDoc, wrap) {

  sessionStorage.setItem('currentFood', JSON.stringify(wrap));

  location.href = '/Customer/customize.html'
}

async function geCustomeItemsForFood() {
  let currentFood = sessionStorage.getItem('currentFood');
  currentFood = JSON.parse(currentFood);
  let totalPrice = +currentFood.basePrice;

  $('#itemname').html(currentFood.name);
  $('#quantity').html(currentFood.quantity);
  $('#price').html(currentFood.basePrice);
  $('#description').html(currentFood.description);
  $('#currentFoodItemImg').html(`
  <img src="${currentFood.imagePath}"    class="img-fluid menu-image"  alt=" " style="width:300px;height:300px;">
  `);

  $('#specialInstructions').val(currentFood.specialInstructions);

  const meats = doc(firbasedb, "Meats", currentFood.name);
  let selectedMeats = currentFood.selectedMeats;

  const docSnap = await getDoc(meats);
  let currentMeatData = docSnap.data();
  if(currentMeatData && currentMeatData.items && currentMeatData.items.length){
    let trmet= '';
    currentMeatData.items.map((itm, i)=>{
      let isSelected = selectedMeats&& selectedMeats.find(mt=>{
        return mt.item == itm.item
      });
      let attrChecked = '';
      if(isSelected){
        totalPrice += +isSelected.price;
        attrChecked = `checked`;
      }
      itm.wrap = currentFood.name;
      itm.id = i+1;
      trmet += `
      <tr>
      <td class="product-thumbnail">
      <input type="checkbox" name="" ${attrChecked} onclick='selectMeat(this, ${JSON.stringify(itm)})'/></td>
      <td>${itm.item}</td>
      <td>$${itm.price}</td>
      </tr>
      `;
    });

    $('#customize_cart_meat tbody').html(trmet);
  }

  let topping = currentFood.toppings;
  let selectedtopings = currentFood.selectedTopings;

  let trow = '';
  if(topping && topping.length){
    topping.map(async (top, index)=>{

      let isSelected = selectedtopings&& selectedtopings.find(mt=>{
        return mt.topping == top
      });
      let attrCheckedTop = '';
      if(isSelected){
        totalPrice += +isSelected.basePrice;
        attrCheckedTop = `checked`;
      }

      // const toppings = doc(firbasedb, "Toppings", top);
      // const docSnap = await getDoc(toppings);
      let currentTopingData = await getToppingData(top);
      if(currentTopingData){

        currentTopingData.topping = top;
        currentTopingData.id = index + 1;
        trow = `
          <tr>
          <td class="product-thumbnail">
            <input type="checkbox" name="" ${attrCheckedTop} onclick='selectToping(this, ${JSON.stringify(currentTopingData)})'/></td>
          <td class="product-name" data-title="Product">${top}</td>
          <td class="product-price" data-title="Price"> <span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">$</span>${currentTopingData.basePrice}</bdi></span> </td>
            </tr>`;

            $('#customize_cart tbody').append(trow);
      }

      return top;
    });
   
  }

  //  const toppings = collection(firbasedb, 'Toppings');
  //  const toppingsSnapshot = await getDocs(toppings);
  //  const toppingData = toppingsSnapshot.docs.map(doc => doc.data());


  // if (currentTopingData) {
  //   currentTopingData.toppings.map((topng, index) => {
  //     topng.id = index + 1;
  //     trow += `
  //       <tr>
  //       <td class="product-thumbnail">
  //         <input type="checkbox" name="" onclick='selectToping(this, ${JSON.stringify(topng)})'/></td>
  //       <td class="product-name" data-title="Product">${topng.toping}</td>
  //       <td class="product-price" data-title="Price"> <span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">$</span>${topng.price}</bdi></span> </td>
  //         </tr>`;

  //     return topng;
  //   });
  // }


  // $('#customize_cart tbody').html(trow);

  $('#totalPrice').html(+currentFood.quantity * totalPrice);

  // console.log(toppingData);
}

function selectMeat(thisEle, meat){
  if (thisEle.checked) {
    selectedMeats.push(meat);
    $('#totalPrice').html(+($('#totalPrice').text()) + +(meat.price));
  } else {
    selectedMeats = selectedMeats.filter(tp => {
      return tp.id != meat.id;
    })
    $('#totalPrice').html(+($('#totalPrice').text()) - +(meat.price));
  }
}


function selectToping(thisEle, toping) {
  if (thisEle.checked) {
    selectedTopings.push(toping);
    $('#totalPrice').html(+($('#totalPrice').text()) + +(toping.basePrice));
  } else {
    selectedTopings = selectedTopings.filter(tp => {
      return tp.id != toping.id;
    })
    $('#totalPrice').html(+($('#totalPrice').text()) - +(toping.basePrice));
  }
  // console.log(toping);
}


$('#cartCheckout').on('click', async function () {
  const cuser = getCurrentUser();
  if (cuser) {

    let currentFood = sessionStorage.getItem('currentFood');
    currentFood = JSON.parse(currentFood);
    currentFood.selectedTopings = selectedTopings || [];
    currentFood.selectedMeats = selectedMeats;
    currentFood.specialInstructions= $('#specialInstructions').val();
    await addToCart(null, currentFood);

    location.href = '/Customer/cart.html';
  } else {
    logoutAndShowLogin();
  }

});


function clearMenuItemForm() {
  $('#sandwichwrapname').val("");
  $('#bread').val("");
  $("#description").val("");
  $('#price').val("");
  $("#available").val("");
  $("#toppings").val("");
  $('#imagePath').val('');
  $('#files').val("");
}




function fetchMenuItems() {
  fetch(firebaseAPI + 'allMenu').then(response => response.json()).then(data => {


    window.upateSandwichWrap = function (prop) {
      $('#sandwichwrapname').val(prop);
      $('#bread').val(data[prop].bread);
      $("#description").val(data[prop].description);
      $('#price').val(data[prop].basePrice);
      $("#available").val(data[prop].available);
      $("#toppings").val(data[prop].toppings);
      $('#imagePath').val(data[prop].imagePath);
      $('#adminMenuModal').modal('show');
      $('#sandwichwrapname').attr('readonly', 'true');
      console.log(data[prop]);
    }

    window.deleteSandwichWrap = function (prop) {
      fetch(firebaseAPI + 'deleteMenu?wrapname=' + prop).then(response => response.text()).then(data => {
        fetchMenuItems();
      });
    }

    window.addToCartOnline = function (thisDoc, prop) {
      let wrap = data[prop];
      wrap.name = prop;
      wrap.quantity = 1;
      addToCart(thisDoc, wrap);

    }

    window.prepareFoodOnline = function (thisdoc, prop) {
      let wrap = data[prop];
      wrap.name = prop;
      wrap.quantity = 1;
      prepareFood(thisdoc, wrap);
    }


    let menuCards = '';
    let meatOptionDropDown = '';
    let customerMenu = '';
    let todaySpecialMenu = '';

    for (const property in data) {
      // data[property].map(menu=>{

      meatOptionDropDown += `
        
        <option value="${property}">${property}</option>
        `;

      menuCards += `
        
        <div class="col-xl-3 col-xxl-4 col-md-4 col-sm-6">
        <div class="card">
            <div class="image-wrapper">
                <img width="300" height="250" class="img-fluid" src="${data[property].imagePath}">
            </div>
            <div class="card-body justify-content-between d-flex">
                <h4 class="d-inline-block">${property}</h4>
                <h4 class="d-inline-block">
                    <span class="text-primary">$ ${data[property].basePrice}</span>
                </h4>
            </div>
            <div class="card-footer d-flex justify-content-sm-end align-items-center">
                <div class="vertical-card__menu--button">
                    <button onclick="upateSandwichWrap('${property}')" class="btn btn-primary">Edit</button>
                    <button onclick="deleteSandwichWrap('${property}')" class="btn btn-primary">Delete</button>
                </div>
            </div>
        </div>
    </div>
  
        `;

      customerMenu += `
        <div class="col-lg-4 col-md-6 col-12">
        <div class="menu-thumb">
            <img width="300" height="250"  src="${data[property].imagePath}">

            <div class="menu-info d-flex flex-wrap align-items-center">
                <h4 class="mb-0">${property}</h4>

                <span class="price-tag bg-white shadow-lg ms-4"><small>$</small>${data[property].basePrice}</span>
                <button type="button" onclick="addToCartOnline(this,'${property}')"><i class="bi bi-cart-plus"></i></button>


                <button type="button" onclick="prepareFoodOnline(this,'${property}')">
                <img src="images/prepare-cooking.jpg" />
                </button>
                <div class="d-flex flex-wrap align-items-center w-100 mt-2">
                    <h6 class="reviews-text mb-0 me-3">4.4/5</h6>

                    <div class="reviews-stars">
                        <i class="bi-star-fill reviews-icon"></i>
                        <i class="bi-star-fill reviews-icon"></i>
                        <i class="bi-star-fill reviews-icon"></i>
                        <i class="bi-star-fill reviews-icon"></i>
                        <i class="bi-star reviews-icon"></i>
                    </div>

                    <p class="reviews-text mb-0 ms-4">128 Reviews</p>
                </div>
            </div>
        </div>
    </div>

        `;

        if(data[property].todaySpecial){
          todaySpecialMenu += `
          <div class="col-lg-4 col-md-6 col-12">
          <div class="menu-thumb">
              <img width="300" height="250"  src="${data[property].imagePath}">
  
              <div class="menu-info d-flex flex-wrap align-items-center">
                  <h4 class="mb-0">${property}</h4>
  
                  <span class="price-tag bg-white shadow-lg ms-4"><small>$</small>${data[property].basePrice}</span>
                  <button type="button" onclick="addToCartOnline(this,'${property}')"><i class="bi bi-cart-plus"></i></button>
  
  
                  <button type="button" onclick="prepareFoodOnline(this,'${property}')">
                  <img src="images/prepare-cooking.jpg" />
                  </button>
                  <div class="d-flex flex-wrap align-items-center w-100 mt-2">
                      <h6 class="reviews-text mb-0 me-3">4.4/5</h6>
  
                      <div class="reviews-stars">
                          <i class="bi-star-fill reviews-icon"></i>
                          <i class="bi-star-fill reviews-icon"></i>
                          <i class="bi-star-fill reviews-icon"></i>
                          <i class="bi-star-fill reviews-icon"></i>
                          <i class="bi-star reviews-icon"></i>
                      </div>
  
                      <p class="reviews-text mb-0 ms-4">128 Reviews</p>
                  </div>
              </div>
          </div>
      </div>
  
          `;
        }



      // });
    }


    $('#allMenuItems').html(menuCards);
    $('#menuListItems').html(customerMenu);
    $('#todaySpecialMenu').html(todaySpecialMenu);
    $('#sandwichwtapname').html(meatOptionDropDown);
  });
}

function cleaToppingItemForm() {
  $('#tPrice').val("");
  $("#tavailable").val("");
  $("#toppingName").val("");
}

$("#addToppingSave").on("click", async function () {
  showLoader();
  const cuser = getCurrentUser();

  if (cuser) {
    let price = $('#tPrice').val();
    let available = $("#tavailable").val();
    let toppingName = $("#toppingName").val();
    fetch(firebaseAPI + 'addTopping?basePrice=' + +price + '&available=' + (available == 'on') + '&name=' + toppingName).then(response => response.text()).then(data => {

      $('#toppingSuccess').html(data);

      cleaToppingItemForm();
      hideLoader();
      setTimeout(() => {
        $('#toppingSuccess').hide();
      }, 10000);
      setToppingsDropdown();
    });

  }
});

$('#addMenuItemSave').on('click', async function () {
  showLoader();
  const cuser = getCurrentUser();

  if (cuser) {

    
    let wrapName = $('#sandwichwrapname').val();
    let bread = $('#bread').val();
    let description = $("#description").val();
    let price = $('#price').val();
    let available = $("#available").val();
    let toppings = $("#toppings").val();
    let imagePath = $('#imagePath').val();
    let todaySpecial = $('#isTodaySpecial').val();

    let file = $('#files').prop("files")[0];
    const storage = getStorage();
    let fNaem= file.name.split('.');
    fNaem[0] = wrapName;
    
     const storageRef = ref(storage, 'menu/'+fNaem.join('.'));
  
  // 'file' comes from the Blob or File API
  uploadBytes(storageRef, file).then(async (snapshot) => {
  let imageUrl = await getImageRef(snapshot.metadata.fullPath);
    console.log('Uploaded a blob or file!');
    let payload = {
      bread,
      description,
      basePrice: +price,
      available: available == 'on',
      todaySpecial:todaySpecial== 'on',
      toppings,
      imagePath: imageUrl
    };
    fetch(firebaseAPI + 'addMenu?name=' + wrapName, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then((response) => response.text()).then(data => {

        $('#itemSuccess').html(data);
        $('#itemSuccess').show();
        clearMenuItemForm();
        hideLoader();
        setTimeout(() => {
          $('#itemSuccess').hide();
        }, 10000);
        fetchMenuItems();
      });
  });
  
  

  } else {
    logoutAndShowLogin();
  }


});

function setToppingsDropdown() {
  fetch(firebaseAPI + 'allToppings').then(response => response.json()).then(data => {

    window.updateTopping = function (prop) {
      $('#tPrice').val(data[prop].basePrice);
      $("#tavailable").prop('checked', data[prop].available);
      $("#toppingName").val(prop);
      $("#toppingName").attr('readonly', 'true');
    }

    window.deleteTopping = function (prop) {
      fetch(firebaseAPI + 'deleteTopping?topping=' + prop).then(response => response.text()).then(data => {

        $('#toppingSuccess').html(data);
        setTimeout(() => {
          $('#toppingSuccess').hide();
        }, 10000);
        setToppingsDropdown();
      });
    }

    let option = "";
    let tr = '';
    for (let prop in data) {
      tr += `
       <tr>
        <td>${prop}</td>
        <td>${data[prop].basePrice}</td>
        <td>${data[prop].available == true ? 'Available' : 'N/A'}</td>
        <td><button onclick="updateTopping('${prop}')"> Edit</button>&nbsp <button onclick="deleteTopping('${prop}')">Delete</button</td>
       </tr>
      `;
      option += `<option value="${prop}" > ${prop} </option>`;
    }
    $("#toppingList tbody").html(tr);
    $('#toppings').html(option);
    console.log(data);

  });
}


function allMeatOptions() {

  fetch(firebaseAPI + 'allMeatOptions').then(response => response.json()).then(data => {
    let trws = '';

    window.updateMeat = function (prop, index) {

      $('#sandwichwtapname').val(prop);
      $('#sandwichwtapname').prop('disable', true);
      $('#meatName').val(data[prop].items[index].item);
      $('#mPrice').val(data[prop].items[index].price);
    }

    window.deleteMeatOption = function (prop, indx) {
      showLoader();
      fetch(firebaseAPI + 'deleteMeatOption?wrap=' + prop + '&item=' + data[prop].items[indx].item).then(response => response.text()).then(data => {
        $('#meatOptionsSuccess').html(data);
        hideLoader();
        allMeatOptions();
      });

    }
    for (let prop in data) {
      if (data[prop].items) {

        // <button onclick="updateMeat('${prop}', ${index})"> Edit</button>&nbsp 
        data[prop].items.map((el, index) => {
          trws += `
        <tr>
        <td>${prop}</td>
 
        <td>${el.item}</td>
        <td>${el.price}</td>
      
        <td><button onclick="deleteMeatOption('${prop}', ${index})">Delete</button</td>
        </tr>
       `;
        });

      }
    }

    $('#meatOptionList tbody').html(trws);
  });
}

function clearMeatForm() {
  $('#sandwichwtapname').val('');
  $('#meatName').val('');
  $('#mPrice').val('');
}

function setMeatOptionDropdown() {

  $('#addMeatOptiongSave').on('click', function () {
    let wrap = $('#sandwichwtapname').val();
    let meatname = $('#meatName').val();
    let price = $('#mPrice').val();
    showLoader();
    fetch(firebaseAPI + 'setMeatOption?name=' + wrap + '&item=' + meatname + '&price=' + price).then(response => response.text()).then(data => {

      $('#meatOptionsSuccess').html(data);
      $('#meatOptionsSuccess').show();
      hideLoader();
      allMeatOptions();
      clearMeatForm();
      setTimeout(() => {
        $('#meatOptionsSuccess').hide();
      }, 10000);

    });



  });

  $('#addMeatOptionsBtn').on('click', function () {
    $('#sandwichwtapname').prop('disable', false);

    $('#sandwichwtapname')
    $('#addMeatOptions').modal('show');
  });

  $('#sandwichwrapname').on('blur', function (e) {
    console.log(e.currentTarget.value);

    fetch(firebaseAPI + 'getMeatOption?name=' + e.currentTarget.value).then(response => response.json()).then(data => {
      console.log(data);
      let option = "";
      if (data && data.items) {

        data.items.map(itm => {
          option += `<option value="${itm.item}" > ${itm.item} </option>`;
        });

        $('#meatOptions').html(option);
      } else {
        $('#meatOptions').attr('disable', true);
      }
    }).catch(e => {
      $('#meatOptions').attr('disable', true);
    });
  });

  // fetch(firebaseAPI + 'allMeatOptions').then(response => response.json()).then(data => {

  //   let option = "";
  //   let tr ='';
  //   for (let prop in data) {
  //     tr += `
  //      <tr>
  //       <td>${prop}</td>
  //       <td>${data[prop].basePrice}</td>
  //       <td>${data[prop].available == true ? 'Available':'N/A'}</td>
  //       <td><button onclick="updateTopping('${prop}')"> Edit</button>&nbsp <button onclick="deleteTopping('${prop}')">Delete</button</td>
  //      </tr>
  //     `;
  //     option += `<option value="${prop}" > ${prop} </option>`;
  //   }
  //   // $("#toppingList tbody").html(tr);
  //   $('#meatOptions').html(option);

  // });

}

function fetchMapAddressDistance(orgin, dest){
  fetch('https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=40.6655101,-73.89188969999998&destinations=40.6905615%2C-73.9976592&key=AIzaSyB24rOLf74be1_jJr4zulBdd8EBdhkATPA').then(data=>{
       console.log(data);
  });
}
function apiGetTruckLocation(){
 return fetch(firebaseAPI+'getTruckLocation').then(data=>data.json());
}
function getLoationLatLng(markerCallback, map){
  showLoader();
  apiGetTruckLocation().then(data=>{
    console.log(data);
    $('#truckLocation').html(data.address);
    $('#footerLocationTruck').html(data.address);
    $('#availbleSlotEnd').html(data.endTime);
    $('#availbleSlotStart').html(data.startTime);

    let mp = `https://maps.google.com/maps?q=${data.lat},${data.lng}&hl=es;z=14&output=embed`;
    $('#truckLocmap').prop('src', mp);
    
    let lt = document.getElementById("latitude");
    let ln =  document.getElementById("longitude");
    if(lt && ln){
      lt.value = data.lat;
      ln.value = data.lng;
    }
   
    if(markerCallback){

      markerCallback({ lat: +data.lat , lng: +data.lng }, map);
    }
    hideLoader();
  });
}

function setTruckLocation(address, lat, lng, startTime, endTime, url){
  apiGetTruckLocation().then(data=>{
    if(!data){
      data ={};
    }

    fetch(firebaseAPI+'setTruckLocation?address='+(address|| data.address) + '&lat='+(lat|| data.lat) +'&lng='+(lng || data.lng)+'&startTime='+ (startTime || data.startTime) +'&endTime='+ (endTime || data.endTime)+'&url='+(url|| data.url)).then(data=>data.text()).then(data=>{
      hideLoader();
      alert(data);
      pageReload();
    });
  });
}

function fetchLatLangAddresss(lat, lng){
  showLoader();
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyB24rOLf74be1_jJr4zulBdd8EBdhkATPA`).then(data=> data.json()).then(data=>{
       console.log(data);
         if(data.status == 'OK'){
          let addressLocality =  data.results.filter(el=>{
              if(el.types.indexOf('administrative_area_level_2')>=0){
                  return el;  
              }
            });

            if(!addressLocality.length){
              addressLocality =  data.results.filter(el=>{
                if(el.types.indexOf('locality')>=0 || el.types.indexOf("political")>=0){
                    return el;  
                }
              });
            }
            if(!addressLocality.length){
              addressLocality =  data.results.filter(el=>{
                if(el.types.indexOf( "plus_code")>=0){
                    return el;  
                }
              });
            }



           

            if(addressLocality.length){
              $('#truckLocation').html(addressLocality[0].formatted_address);

              setTruckLocation(addressLocality[0].formatted_address, lat, lng,null,null, null);
       
             
            }else{
              hideLoader();
              console.log(data.results);
            }
         }

      
  });
}



function setTruckTimings(start, end) {
  showLoader();
  apiGetTruckLocation().then(data=>{
    if(start){
      data.startTime = start;
    }

    if(end){
      data.endTime = end;
    }

    fetch(firebaseAPI+'setTruckLocation?address='+data.address + '&lat='+data.lat +'&lng='+data.lng+'&startTime='+ data.startTime +'&endTime='+data.endTime+'&url='+data.url).then(data=>data.text()).then(data=>{
      hideLoader();
      if(start){

        alert("Start time slot updated!");
      }else{
        alert("End time slot updated!");
      }
    });

  });
}
function truckStartEndTime(){

  var times = {}, re = /^\d+(?=:)/;

for (var i = 13, n = 1; i < 24; i++, n++) {
  times[i] = n < 10 ? "0" + n : n
}



var truckEndTime = document.getElementById("end-time");
var truckStartTime = document.getElementById("start-time");

truckEndTime.onchange = function () {
  var time = this
  , value = time.value
  , match = value.match(re)[0];
  $('#availbleSlotEnd').html((match && match >= 13 ? value.replace(re, times[match]) : value)  + (time.valueAsDate.getTime() < 43200000 ? " AM" : " PM"));

  setTruckTimings( null, $('#availbleSlotEnd').html(),);
};
truckStartTime.onchange = function () {
  var time = this
  , value = time.value
  , match = value.match(re)[0];
  $('#availbleSlotStart').html((match && match >= 13 ? value.replace(re, times[match]) : value)  + (time.valueAsDate.getTime() < 43200000 ? " AM" : " PM"));
  setTruckTimings( $('#availbleSlotStart').html());
};;

}

function uploadImage(e){
 
  
}

function orderdetailsClose(){
  $('#orderDetails').modal('hide');
}


async function getImageRef(path){
  let storage = getStorage();
 let url = await getDownloadURL(ref(storage, path));
  // .then((url) => {
    // `url` is the download URL for 'images/stars.jpg'

    // This can be downloaded directly:
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = (event) => {
      const blob = xhr.response;
    };
    xhr.open('GET', url);
    xhr.send();
return url;
    // Or inserted into an <img> element
    // const img = document.getElementById('myimg');
    // img.setAttribute('src', url);
  // })
  // .catch((error) => {
  //   // Handle any errors
  // });
}

function renderFullcalendar(events){
   calendar = new FullCalendar.Calendar(document.getElementById('calendarorders'), {
    plugins: [ 'dayGrid' ],
    
    defaultView: 'dayGridMonth',
    eventLimit: true,
    disableResizing:true,
    resizable: false,
    eventStartEditable:false,
    views: {
      month: {
        eventLimit: 4// adjust to 6 only for timeGridWeek/timeGridDay
      }
    },
    eventMouseover:function(info){
      console.log(info);
    },
    eventRender: function(info) {
      var tooltip = new Tooltip(info.el, {
        title: info.event.extendedProps.title,
        placement: 'top',
        trigger: 'hover',
        container: 'body'
      });
    },
    events: events
  });
  // calendar.addEvent({ title: 'new event', start: '2022-10-05' });
  calendar.render();
  
  
  // var event = calendar.getEventById('a') // an event object!
  // var start = event.start // a property (a Date object)
  // console.log(start.toISOString()) // "2018-09-01T00:00:00.000Z"
}

function forgotPassword(){
  let email = prompt("Please enter your email", "");
  if(email !=null){

    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password reset email sent!");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if(error && error.code == 'auth/user-not-found'){
          alert("Please enter valid email address!")

        }
        // ..
      });
  }
}
$('#dlgUpdate').hide();
$('#currentUser').on('click', async function(){
  $('#dlgregister').hide();
  $('#dlgPwd').hide();
  $('#dlgConfirmPwd').hide();
  $('#semail').attr('readonly', true);
  $('#dlgUpdate').show();
  $('#dlgUpdate #changePassowrdLnk').html('<a href="#" onclick="changePassword()">Change Password</a>');
  let curUser = getCurrentUser();
 let userDetails  = await getDoc(doc(firbasedb, "USERS", curUser.uid));

 let udata = userDetails.data();
  $('#BModalSignup .modal-header h3').html('Profile');

  $('#fname').val(udata.fname);
  $('#sphone').val(udata.phoneNumber);

  $('#lname').val(udata.lname);
  $('#semail').val(udata.email);

     $('#BModalSignup').modal('show');
});

$('#dlgUpdateBtn').on('click', async function(){
  showLoader();
  let fname = $('#fname').val();
  let lname = $('#lname').val();
  let sphone = $('#sphone').val();
  let semail = $('#semail').val();
  let curUser = getCurrentUser();
  await setDoc(doc(firbasedb, "USERS", curUser.uid), {
    phoneNumber: sphone,
    lname:lname,
    fname: fname,
    email: semail

  });
  sessionStorage.setItem("displayname", fname +' '+ lname);
  hideLoader();
  $('#infoMsg').html("User updated successfully! Please login");
  clearSignupForm();
  pageReload();
});

function changePassword(){
  
  const auth = getAuth();
let usr= getCurrentUser();
  sendPasswordResetEmail(auth, usr.email)
    .then(() => {
      alert("Password change  line sent to your mail id, please check!");
      pageReload();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      if(error && error.code == 'auth/user-not-found'){
        alert("Please enter valid email address!")

      }
      // ..
    });
}

async function runOrdersNotification() {
  let adminOrders = collection(firbasedb, 'Orders');
  let adminOrdersSnapshot = await getDocs(adminOrders);
  let adminOrdersList = adminOrdersSnapshot.docs.map(doc => doc.data());
  if(adminOrdersList && adminOrdersList.length){
    let totalOrders = 0;
    totalOrders = adminOrdersList.reduce((acc, nt)=>{
      return nt.items.length + acc;
    }, 0);
   
    sessionStorage.setItem('currentOrders', totalOrders);
  }


}

function monitorOrders(){
  const cuser = getCurrentUser();
  if(cuser && cuser.email != 'admin@gmail.com'){
    return;
  }
  const q = query(collection(firbasedb, "Orders"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    // const cities = [];
    let currentOrderCount = sessionStorage.getItem('currentOrders');
    let totalOrders = 0;
    querySnapshot.forEach((doc) => {
      totalOrders += doc.data().items.length;
  });
  sessionStorage.setItem('currentOrders', totalOrders);

   if(currentOrderCount && +totalOrders > +currentOrderCount ){

  Notification.requestPermission().then((permission) => {
    // If the user accepts, let's create a notification
    if (permission === "granted") {
      const notification = new Notification("New order was placed !");
      // ???
    }
  });

 }

  // console.log(cities);
    //  alert("Order placed !");
  });
}
// setInterval(async()=>{
//   let currentOrderCount = sessionStorage.getItem('currentOrders');
//    await runOrdersNotification();
//  let latestCount =  sessionStorage.getItem('currentOrders');
//  if(currentOrderCount && +latestCount > +currentOrderCount ){

//   Notification.requestPermission().then((permission) => {
//     // If the user accepts, let's create a notification
//     if (permission === "granted") {
//       const notification = new Notification("New order placed !");
//       // ???
//     }
//   });

//  }
// }, 10000);







