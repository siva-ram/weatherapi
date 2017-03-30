Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
            (mm > 9 ? '' : '0') + mm,
            (dd > 9 ? '' : '0') + dd
    ].join('');
};
Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}
Date.prototype.getUnixTime = function () { return this.getTime() / 1000 | 0 };

angular
   .module('firstApplication', ['ngMaterial', 'ngMessages'])
   .controller('dateController', dateController);

function dateController($scope, $http) {
    $scope.myDate = new Date();
    $scope.displayChart = false;
    $scope.submit = function () {
        if ($scope.myForm.$invalid) {
            return;
        }
        else {
            $scope.displayChart = true;
        }

        //alert($scope.myDate.yyyymmdd());
        //draw(test);
        $http.get("/forecast/" + $scope.myDate.yyyymmdd())
         .then(function (response) {
             $scope.details = response.data;
             //svg = d3.select(".svg1")
             draw(response.data.slice(0, -1), ".svg1");
             $scope.displayChart = true;
             //response.daily.data[0].time, response.daily.data[0].temperatureMin,response.daily.data[0].temperatureMax
             //"https://api.darksky.net/forecast/575b58915a86e7ddc1d8501d83a1b2c4/39.1031,-84.5120,"+$scope.myDate.toISOString()+"?exclude=currently,flags,minutely,hourly,alerts"
         }, function (response) {
             alert("error in getting data from own api");
         });
        var array = [];

        $scope.forecast = function (i) {
            $http.get("/darksky/"
                         + $scope.myDate.addDays(i).getUnixTime())
             .then(function (response) {
                 obj = {};
                 obj.DATE = $scope.myDate.addDays(i).yyyymmdd().toString();
                 obj.TMAX = response.data.daily.data[0].temperatureMax
                 obj.TMIN = response.data.daily.data[0].temperatureMin
                 array.push(obj)
                 if (array.length == 6) {
                     array.sort(function (a, b) { return (a.DATE > b.DATE) ? 1 : ((b.DATE > a.DATE) ? -1 : 0); });
                     draw(array, ".svg2")
                 };
             }, function (response) {
                 alert("error in getting data from darksky api");
             });
        }


        for (var i = 0; i < 6; i++) {
            $scope.forecast(i)
            //svg = d3.select(".svg2")


        }


    };

}

