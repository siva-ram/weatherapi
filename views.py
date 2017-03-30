from flask_restful import Resource, Api, abort, reqparse
from tinydb import TinyDB, Query
from flask import Flask, request, send_from_directory
import json
import random
from datetime import datetime, timedelta
from flask_restful.utils import cors
import urllib2, urllib

app = Flask(__name__)
api = Api(app)
api.decorators=[cors.crossdomain(origin='*')]
db = TinyDB('C:\\Users\\Siva\'s PC\\documents\\visual studio 2015\\Projects\\w2\\weatherapi\\weatherapi\\weatherapi\\db2.json')
temp=Query()


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

def search_day(val,date_month,date_day):
    dt = datetime.strptime(str(val), "%Y%m%d")
    return dt.month==date_month and dt.day==date_day

class weatherApi1(Resource):
    #get all dates
    def get(self):
        return [{"DATE": str(element['dates'])} for element in db.all()]
    
    # create or update the data for a date
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('DATE')
        parser.add_argument('TMAX')
        parser.add_argument('TMIN')

        args = parser.parse_args()

        if args['DATE'] and args['TMAX'] and args['TMIN']:
            if is_number(args['TMAX']) and is_number(args['TMIN']) and validate_date(args['DATE']):
                if db.search(temp['dates'] == int(args['DATE'])):
                    db.update({'tmax': float(args['TMAX']), 'tmin': float(args['TMIN'])}, temp.dates == int(args['DATE']))
                else:
                    db.insert({'dates': int(args['DATE']) , 'tmax': float(args['TMAX']), 'tmin': float(args['TMIN'])})     
                return {'DATE': str(args['DATE'])}, 201
        return {"message" : "Bad request"}, 400 
           
    
class weatherApi2(Resource):
    #get data for a particular date
    def get(self,date_value):
        #db = TinyDB('db2.json')
        
        #with open('daily.json') as data_file:    
        #    data = json.load(data_file)
        #    db.insert_multiple(data)
        foundDate = db.search(temp['dates'] == date_value)
        if not foundDate:
           return {"message" : "Date not found"}, 404
        output =  {}
        output["DATE"]=  str(foundDate[0]['dates'])
        output["TMAX"]=  float("{0:.1f}".format(foundDate[0]['tmax']))
        output["TMIN"]=  float("{0:.1f}".format(foundDate[0]['tmin']))
        return  output
    
    #delete data for a date
    def delete(self, date_value):
        foundDate = db.search(temp['dates'] == date_value)
        if not foundDate:
           return {"message" : "Date not found"}, 404
        db.remove(temp['dates'] == date_value)
        return '', 204


class weatherApi3(Resource):
    #forecast - calculation based on average temperatures of for the day in the previous years
    def get(self,date_value):
        mylist = []
        
        if validate_date(str(date_value)):
            dt = datetime.strptime(str(date_value), "%Y%m%d")
            for i in range(0, 7):
                dt2 = dt + timedelta(days=i) 
                foundDate = db.search(temp['dates'] == int(dt2.strftime('%Y%m%d')))
                if not foundDate:
                    foundDates=db.search(temp.dates.test(search_day,dt2.month,dt2.day))
                    sum_max=0
                    sum_min=0
                    if foundDates:
                        for x in foundDates:
                            sum_max += x['tmax']
                            sum_min += x['tmin']
                        avg_max = round(sum_max/len(foundDates),1)
                        avg_min = round(sum_min/len(foundDates),1)
                    else:
                        avg_max = 30
                        avg_min = 25
                    random.seed(int(dt2.strftime('%Y%m%d')))  
                    temp_max=avg_max+random.uniform(0.5, 1.5)
                    temp_min=avg_min+random.uniform(-0.5, 0.5)                    
                else:
                    temp_max=foundDate[0]['tmax']
                    temp_min=foundDate[0]['tmin']
                output =  {}
                output["DATE"]=  str(dt2.strftime('%Y%m%d'))
                output["TMAX"]=  float("{0:.1f}".format(temp_max))
                output["TMIN"]=  float("{0:.1f}".format(temp_min))
                mylist.append(output)
        else:
            return {"message" : "Bad request"}, 400   
        return  mylist


class weatherApi4(Resource):
    #forecast - using darksky service
    def get(self,date_value):
         url = "https://api.darksky.net/forecast/575b58915a86e7ddc1d8501d83a1b2c4/39.1031,-84.5120,"+str(date_value)+"?exclude=currently,flags,minutely,hourly,alerts"
         result = json.loads(urllib2.urlopen(url).read())
         return  result

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('static', path)

@app.route("/")
def static_index():
    return send_from_directory('static', 'index.html')

api.add_resource(weatherApi2,'/historical/<int:date_value>')
api.add_resource(weatherApi1, '/historical/')
api.add_resource(weatherApi3,'/forecast/<int:date_value>')
api.add_resource(weatherApi4,'/darksky/<int:date_value>')


if __name__ == '__main__':
    app.run()