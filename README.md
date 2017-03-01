# weatherapi 
######Restful service created using Flask-Restful, nginx and Gunicorn (http://weatherapi.hopto.org)
---------------------------------------

Developed the Restful Api for getting weather information using Python 2.7 Flask, Flask-Restful, Nginx and Gunicorn

The following packages were used to develop the service

1. Flask : micro web framework 
2. Flask-Restful: Package for developing Restful service on Flask
3. TinyDB - A NoSQL database based on JSON.

API Endpoints

Defined following endpoints in code

```
api.add_resource(weatherApi1, '/historical/')
api.add_resource(weatherApi2,'/historical/<int:date_value>')
api.add_resource(weatherApi3,'/forecast/<int:date_value>')
```

The endpoint /historical accepts two kinds get requests one with optional date value provided(e.g. /historical/20140101). It also accepts Post and Delete requests for creating/updating temperature information for a date and deleting information for a date respectively.

sample requests

Get request:
```
/historical/20130101
Output : {"DATE":"20130101","TMAX":34.0,"TMIN":26.0}
```
Post request:
```
/historical/ 
data: {"DATE":"20130101","TMAX":34.0,"TMIN":26.0}
output: {“DATE":"20130101"}
```

The forecast endpoint can be used to forecast weather information for the next 7 days
```
eg: /forecast/20130101

output: [{"DATE":"20130101","TMAX":
34.0,"TMIN":26.0},
{"DATE":"20130102","TMAX":
29.5,"TMIN":15.0},
{"DATE":"20130103","TMAX":
34.5,"TMIN":12.0},
{"DATE":"20130104","TMAX":
36.5,"TMIN":23.0},
{"DATE":"20130105","TMAX":
41.0,"TMIN":19.0},
{"DATE":"20130106","TMAX":
40.0,"TMIN":28.0},
{"DATE":"20130107","TMAX":
39.5,"TMIN":19.0} ]
```

Forecast is based on existing data. 
For example if forecast for 2017-03-01 is required, I calculating the average temperature of the day based on previous years i.e;
I'm calculating average value of existing data 2013-03-01, 2014-03-01...
Finally i am adding a random nmber between 0 and 2 to the calculated average.


####TinyDB
TinyDB stores the data in JSON format in files. I initially loaded the data in CSV into the db using a separate program I wrote.

sample row stored in the json file:
```
"1": {
      "dates": 20130101,
      "tmin": 26,
      "tmax": 34
    }
```
It provides several methods for doing CRUD operations. For example

```
Retreiving a info for a date:
 db.search(temp['dates'] == date_value)
 
 Updating weather info for a date:
 db.update({'tmax': float(args['TMAX']), 'tmin': float(args['TMIN'])}, temp.dates == int(args['DATE']))
 
 deleting:
 db.remove(temp['dates'] == date_value)
 ```
-------------------------
Other main section of the code include validation functions for validating date ad temperature information provided by the user
```
def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False

def validate_date(date_text):
    if len(str(date_text))==8:
        try:
            datetime.strptime(date_text, "%Y%m%d")
            return True
        except ValueError:
            return False
    else:
        return False
```
        
        
Nginx config: (/etc/nginx/conf.d/virtual.conf)

```        
server {
    listen       80;
    server_name  weatherapi.hopto.org;

    location / {
        proxy_pass http://127.0.0.1:8000;
    }
}
```

Code to run app using gunicorn 
```
gunicorn main:app -b localhost:8000 &
`
