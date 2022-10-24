

return;
var itr = moment.twix(new Date('2022/09/01'),new Date('2022/09/12')).iterate("days");
var range=[];
while(itr.hasNext()){
    range.push(itr.next().format("DD/MM/YYYY"))
}
console.log(range);
var myChart = new Chart("earnings_bar_chart", {
    type: "bar",
    data: {
        labels:range,
        datasets: [{
          label: 'Orders',
          data: [65, 59, 80, 81, 56, 55, 40],
   
          borderWidth: 1
        }]
      },
    options: {}
  });

  var meatOrders = new Chart("meat_orders", {
    type: "bar",
    data: {
        labels:range,
        datasets: [{
          label: 'Meat Orders',
          data: [65, 59, 80, 81, 56, 55, 40],
   
          borderWidth: 1
        }]
      },
    options: {}
  });

  $('#yearSelection').on('change', function(){
    myChart.data.labels = moment.monthsShort();

    myChart.update();
  });

  $('#yearMeatSelection').on('change', function(){
    meatOrders.data.labels = moment.monthsShort();

    meatOrders.update();
  });
