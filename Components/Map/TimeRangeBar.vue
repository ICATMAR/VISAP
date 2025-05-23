<template>
    <div id="app-timebar">

      <div class="container-flex bottom-0 left-0 right-0" style="width:100%;">

        <!-- One row containing two columns. Col1 is start-end info. Col2 is timeline-->
        <div class="row justify-content-start m-0" style="flex-wrap: nowrap">
          <div class="col-sm-2 p-0 hiddenInMobile" style="max-width: 130px; min-width: 130px">
            <!-- Start and ending date -->
            <div class="infoStartEndDate p-2 h-100 notextselect">
              <div><b>Start:</b> {{startStr}}</div>
              <div><b>End:</b> {{endStr}}</div>
            </div>
          </div>
          <div class="col p-0">
            <!-- Range slider -->
            <range-slider 
                ref="rangeSlider"
                @change="onRangeSliderChange($event)" 
                @mousedown="onRangeSliderMouseDown($event)" 
                @mouseup="onRangeSliderMouseUp($event)"
                @drag="onRangeSliderDrag($event)" 
              style="height: 50px"></range-slider>

            <!-- Year calendar -->
            <div class="timeline">
              <button v-for="yy in years" class="m-0 p-0" :class="[yy.ww == 0 ? 'hiddenClass' : yy.num % 2 == 0 ? 'yearButton' : 'yearButton even']" @click="onYearClicked($event)" :key="yy.num" :id="yy.num" :title="yy.num" :style="{width: yy.ww + '%'}">{{yy.num}}</button>
            </div>

            <!-- Month calendar -->
            <div class="timeline" ref="monthTimeline">
              <button v-for="mm in months" class="m-0 p-0" :class="[mm.ww == 0 ? 'hiddenClass' : 'monthButton']" @click="onMonthClicked($event)" :key="mm.key" :id="mm.key" :title="mm.title" :style="{width: mm.ww + '%'}">{{$t(mm.name)}}</button>
            </div>

          </div>

        </div>
        
      </div>
    </div>
</template>






<script>
// Import components
import RangeSlider from 'Components/Map/RangeSlider.vue'

export default {
    name: "app-timebar",
    created (){
      // Non-reactive variables this.$options.
      this.startDate = new Date(2018, 7, 21); // month + 1, e.g., 7 is August
      this.endDate = new Date();
      // Start and end dates if startDate and endDate are flexible
      this.limStartDate = new Date(2018, 7, 21); 
      this.limEndDate = new Date();

      // Month names
      this.monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      this.monthAbbr = [
        ['J', 'Jan', 'January'],
        ['F', 'Feb', 'February'],
        ['M', 'Mar', 'March'],
        ['A', 'Apr', 'April'],
        ['M', 'May', 'May'],
        ['J', 'Jun', 'June'],
        ['J', 'Jul', 'July'],
        ['A', 'Aug', 'August'],
        ['S', 'Sep', 'September'],
        ['O', 'Oct', 'October'],
        ['N', 'Nov', 'November'],
        ['D', 'Dec', 'December']
      ];

      // Range slider states
      this.isRangeChanging = false;
      this.isRangeDragging = false;
      // Range array // TODO: initialize with values default values from RangeSlider. Could put a emit on mounted in range slider to set it
      this.rangeArray = [25, 75];
      // Update rate
      this.dayIncrement = 5;
      this.FRAMERATE = 40;
      
    },
    mounted (){
      this.createHTMLTimeline();
      window.addEventListener('resize', this.setMonthNames);

      // Hauls loaded, define limits of start and end dates
      window.eventBus.on('Map_HaulsLoaded', geoJSON => {
        let earliestYear = new Date().getUTCFullYear();
        let latestYear = 2018;
        for (let i = 0; i < geoJSON.features.length; i++){
            let feat = geoJSON.features[i];
            let year = feat.properties.info.Date.getUTCFullYear();
            earliestYear = Math.min(earliestYear, year);
            latestYear = Math.max(latestYear, year);
        }
        this.limStartDate = new Date(earliestYear - 1, 10, 1);
        this.limEndDate = new Date(latestYear + 1, 3, 1);
        this.startDate = new Date(earliestYear - 1, 10, 1);
        this.endDate = new Date(latestYear + 1, 3, 1);
        this.updateHTMLTimeline();
      });
    },
    unmounted() {
      window.removeEventListener('resize', this.setMonthNames);
    },
    setup() {
        
    },
    data (){
      return {
        months: [],
        years: [],
        selStartDate: new Date(),
        selEndDate: new Date(),
        startStr: '',
        endStr: '',
      }
    },
    methods: {
      // USER HTML ACTIONS
      onRangeSliderChange: function(rangeArray){
        this.rangeArray = rangeArray;
      },

      onRangeSliderDrag: function(rangeArray){
        this.rangeArray = rangeArray;
        this.isRangeDragging = true;
      },
      // Range slider clicked
      // This event is also capturing general mouse down, not only emit. One solution is to check if the event (rangeArray) is an array
      // The other solution is to make a custom event, like rangedown, instead of the general mousedown
      onRangeSliderMouseDown: function(rangeArray){
        // Mouse event has undefined length
        if (rangeArray.length == 2){
          this.isRangeChanging = true;
          this.updateRangeSlider();
        }
      },
      // Range slider is not clicked anymore
      onRangeSliderMouseUp: function(rangeArray){
        this.isRangeChanging = false;
        this.isRangeDragging = false;
      },

      // Update loop according to range slider
      updateRangeSlider: function(){
        // Middle handle (dragging)
        if (this.isRangeDragging){
          if (this.rangeArray[0] < 10){
            this.dayIncrement = 10 - this.rangeArray[0];
            if (this.decreaseStartingDate())
              this.decreaseEndingDate();
           //this.updateHTMLTimeline();
          } else if (this.rangeArray[1] > 90){
            this.dayIncrement = this.rangeArray[1] - 90;
            if (this.increaseEndingDate())
              this.increaseStartDate();
            //this.updateHTMLTimeline();
          }
        } 
        // Right-Left handles
        else {
          if (this.rangeArray[0] < 10){     
            this.dayIncrement = 10 - this.rangeArray[0]; 
            this.decreaseStartingDate();
            //this.updateHTMLTimeline();
          }
          else if (this.rangeArray[1] > 90){
            this.dayIncrement = this.rangeArray[1] - 90;
            this.increaseEndingDate();
            //this.updateHTMLTimeline();
          }
        }
        // Update selected start and end dates
        let totalTime = this.endDate.getTime() - this.startDate.getTime();
        this.selStartDate.setTime(this.startDate.getTime() + totalTime*this.rangeArray[0]/100);
        this.selEndDate.setTime(this.startDate.getTime() + totalTime * this.rangeArray[1]/100);

        // Update HTML timeline
        this.updateHTMLTimeline();

        // Update loop
        if (this.isRangeChanging){
          setTimeout(() => {
              this.updateRangeSlider()
            }, this.FRAMERATE);
        }
      },

      // Display the year on the timeline
      onYearClicked: function(event){
        let year = parseInt(event.target.id);
        let sDate = new Date(Math.max(new Date(year - 1, 11, 1), this.limStartDate)); // Limit start date
        let eDate = new Date(Math.min(new Date(year + 1, 0, 31), this.limEndDate)); // Limit end date
        // If year is clicked twice, open timeline
        if (sDate.toISOString() == this.startDate.toISOString() && eDate.toISOString() == this.endDate.toISOString()){
          this.startDate = new Date(this.limStartDate);
          this.endDate = new Date(this.limEndDate);
          this.selStartDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 1, this.startDate.getDate());
          this.selEndDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth() - 1, this.startDate.getDate());
        } else{
          this.startDate = sDate;
          this.endDate = eDate;
          // Change selected dates to cover the whole year
          this.selStartDate = new Date(Math.max(new Date(year, 0, 1), this.limStartDate)); // Limit selected start date
          this.selEndDate = new Date(Math.min(new Date(year, 11, 31), this.limEndDate)); // Limit selected start date
        }

        // Set handles in range slider
        this.setRangeSlider();
        this.updateHTMLTimeline();
      },

      // Display +2 -2 months on the timeline
      onMonthClicked: function(event){
        let month = parseInt(event.target.id.split('-')[0]);
        let year = parseInt(event.target.id.split('-')[1]);
        let selDate = new Date(year, month);
        let sDate = new Date(Math.max(this.limStartDate, selDate.setMonth(selDate.getMonth() - 2)));
        let eDate = new Date(Math.min(this.limEndDate, selDate.setMonth(selDate.getMonth() + 5)));
        // If month is clicked twice, open year
        // TODO: USER TEST - MAYBE CONFUSING?
        if (sDate.toISOString() == this.startDate.toISOString() && eDate.toISOString() == this.endDate.toISOString()){
          this.onYearClicked({target: {id: year}});
          return;
        }


        this.startDate = sDate;
        this.endDate = eDate;
        // Change selected dates to cover the months
        this.selStartDate = new Date(this.startDate.getTime());
        this.selStartDate.setDate(this.selStartDate.getDate() + 15); // Add half a month
        this.selEndDate = new Date(this.endDate.getTime());
        this.selEndDate.setDate(this.selEndDate.getDate() - 15); // Remove half a month
        
        // Set handles in range slider
        this.setRangeSlider();
        this.updateHTMLTimeline();
      },


      // INTERNAL METHODS
      // Decrease starting date (returns false if the starting date does not decrease)
      decreaseStartingDate(){
        this.startDate.setDate(this.startDate.getDate() - this.dayIncrement);
        if (this.startDate < this.limStartDate){
          this.startDate = new Date(Math.max(this.limStartDate, this.startDate));
          return false;
        }
        return true;
      },
      // Decrease ending date
      decreaseEndingDate(){
        this.endDate.setDate(this.endDate.getDate() - this.dayIncrement);
      },
      // Increase starting date
      increaseStartDate(){
        this.startDate.setDate(this.startDate.getDate() + this.dayIncrement);
      },
      // Increase ending date (returns false if the ending date does not increase)
      increaseEndingDate(){
        this.endDate.setDate(this.endDate.getDate() + this.dayIncrement);
        if (this.endDate > this.limEndDate){
          this.endDate = new Date(Math.min(this.limEndDate, this.endDate));
          return false;
        }
        return true;
      },


      // Update selected start-end dates
      updateStartEndInfo(){
        
        this.startStr = this.selStartDate.toDateString().substring(4);
        this.endStr = this.selEndDate.toDateString().substring(4);
        // Emit
        this.$emit('changeSelDates', [this.selStartDate, this.selEndDate]);
        this.$emit('changeLimits', [this.startDate, this.endDate]);
      },


      // Creates the years and months arrays (HTML elements by vue) according to end and start date
      createHTMLTimeline: function(){
        let startMonth = this.startDate.getMonth();
        let startDay = this.startDate.getDate();
        let endMonth = this.endDate.getMonth();
        let endDay = this.endDate.getDate();
        
        // Calculate how many years (and a percentage of the year too)
        // Calculate how many months are between end and start date
        // Calculate how many days
        let startYear = this.startDate.getFullYear();
        let endYear = this.endDate.getFullYear();
        let totalYears = endYear - startYear;
        
        // Start and end year are different
        if (totalYears != 0){
          this.years = [{num: startYear, ww: (11-startMonth + (31-startDay)/31)/12}];// Todo: number of days is relative to the month
          this.months = [{num: startMonth, ww: (31-startDay)/31, key: startMonth + "-" + startYear, year: startYear, name: this.monthNum2Str(startMonth)}];
          // Fill months from first year
          for (let i = startMonth + 1; i < 12; i++){
            this.months.push({num: i, ww: 1, key: i + "-" + startYear, year: startYear, name: this.monthNum2Str(i)});
          }

          // Fill years
          for (let i = 1; i<=totalYears; i++){
            if (startYear + i != endYear){
              this.years.push({num: startYear + i, ww: 1});
              // Fill months
              for (let j = 0; j<12; j++){
                this.months.push({num: j, ww: 1, key: j + "-" + (startYear+i), year: (startYear + i), name: this.monthNum2Str(j)});
              }
            } else { // Last year is not necessarily complete
              this.years.push({num: endYear, ww: (endMonth + endDay/31)/12});// Todo: number of days is relative to the month
              // Fill months last year
              for (let j = 0; j<=endMonth; j++){
                if (j != endMonth)
                  this.months.push({num: j, ww: 1, key: j + "-" + (endYear), year: endYear,  name: this.monthNum2Str(j)});
                else
                  this.months.push({num: j, ww: endDay/31, key: j + "-" + (endYear), year: endYear, name: this.monthNum2Str(j)});
              } 
            }
          }
        } 
        // Start and end year are the same
        else {
          this.years = [{num: startYear, ww: ((endMonth + endDay/31) - (11 - startMonth + (31-startDay)/31)) / 12}];
        }


        // Set selected start and end dates
        this.selStartDate = new Date(startYear, startMonth + 1, startDay);
        this.selEndDate = new Date(endYear, endMonth - 1, endDay);
        this.setRangeSlider();
        
        
        // Calculate ww according to number of years/months
        this.calcWidthPercentage();
        // Change month name according to width in pixels
        this.setMonthNames();
        // TODO ERROR: NONE OF THIS WORKS. THE SIDE PANEL CHANGES WIDTH AND SHRINKS monthTimeline, CHANING ITS WIDTH. IT SHOULD DISPATCH AN EVENT BUT IT DOES NOT
        // It is fixed by doing a concatenation of events
        this.$refs.monthTimeline.addEventListener('resize', this.setMonthNames);
        //this.$refs.monthTimeline.addEventListener("webkitTransitionEnd", this.setMonthNames); // Code for Chrome, Safari and Opera
        //this.$refs.monthTimeline.addEventListener("transitionend", this.setMonthNames); // Standard syntax

        // Update selected start-end dates
        this.updateStartEndInfo();

        //console.log(...this.months);
      },


      // Updates the width and visibility of the months and years according to the start and end dates
      updateHTMLTimeline: function(){
        let startYear = this.startDate.getFullYear();
        let startMonth = this.startDate.getMonth();
        let startDay = this.startDate.getDate();
        let endYear = this.endDate.getFullYear();
        let endMonth = this.endDate.getMonth();
        let endDay = this.endDate.getDate();
        let totalYears = endYear - startYear;
        
        // Find reactive array indexes
        let sIdxMonths;
        let sIdxYears;
        
        this.months.forEach((mm, index) => {
          if (mm.key == startMonth + '-' + startYear)
            sIdxMonths = index;
        })
        this.years.forEach((yy, index) => {
          if (yy.num == startYear)
            sIdxYears = index;
        })
        // Set everything to zero, then assign
        this.years.forEach(yy => yy.ww = 0);
        this.months.forEach(mm => mm.ww = 0);
        
        // Set weights
        // Iterate over years
        for (let idxY = startYear; idxY <= endYear; idxY++){
          let sM = 0;
          let eM = 11;
          let sumM = 0;
          if (idxY == startYear) // We are in the first year
            sM = startMonth;
          if (idxY == endYear) // We are in the first year
            eM = endMonth;
          // Iterate over the months of the year
          for (let idxM = sM; idxM <= eM; idxM++){
            // Optimize? save in a separate array and later assign
            let monthlyWeight = 0;
            if (idxM == sM && idxY == startYear) // First month
              monthlyWeight = (31-startDay+1)/31;
            else if (idxY == endYear && idxM == endMonth) // Last month
              monthlyWeight = endDay/31;
            else
              monthlyWeight = 1;
            // Store weight
            this.months[sIdxMonths].ww = monthlyWeight;
            // Increase monthly index
            sIdxMonths++;
            // Store sum for yearly weight
            sumM += monthlyWeight;

          }
          // Calculate year weights based on the months
          this.years[sIdxYears].ww = sumM/12;
          // Increase yearly index
          sIdxYears++;          
        }
        
        
        // Calculate ww according to number of years/months
        this.calcWidthPercentage();
        // Change month name according to width in pixels
        this.setMonthNames();
        // Update selected start-end dates
        this.updateStartEndInfo();

      },




      // Calculate width percentage according to weight
      calcWidthPercentage: function(){
        // For months
        let totalMonthWW = 0;
        this.months.forEach(mm => totalMonthWW += mm.ww); // Calculate total month proportion or width
        this.months.forEach(mm => mm.ww = 100 * mm.ww/totalMonthWW); // Apply width according to element width
        // For years
        let totalYearWW = 0;
        this.years.forEach(yy => totalYearWW += yy.ww); // Calculate total month proportion or width
        this.years.forEach(yy => yy.ww = 100 * yy.ww/totalYearWW); // Apply width according to element width
      },

      // Change the month name according to the width in pixels
      setMonthNames: function(){
        
        let totalWidth = this.$refs.monthTimeline.offsetWidth;
        this.months.forEach(mm => {
          let pixelWidth = mm.ww/100 * totalWidth;
          if (pixelWidth < 20)
            mm.name = '';
          else if (pixelWidth < 40)
            mm.name = this.monthAbbr[mm.num][0];
          else if (pixelWidth < 60)
            mm.name = this.monthAbbr[mm.num][1];
          else
            mm.name = this.monthAbbr[mm.num][2];

          // Define title for tootlip
          mm.title = this.monthAbbr[mm.num][2] + ", " + mm.year;
        });
        
      },

      // Month num to Month string
      monthNum2Str: function(monthNum){
        return this.monthNames[monthNum];
      },

      // Set time range slider according to selected start and end dates
      setRangeSlider: function(){
        let sTime = this.startDate.getTime();
        let eTime = this.endDate.getTime();

        // Calculate percentages
        let timespan = eTime - sTime;
        let sPercentage = 100 * (this.selStartDate.getTime() - sTime )/timespan;
        let ePercentage = 100 - 100 * (eTime - this.selEndDate.getTime())/timespan;

        
        if (this.$refs.rangeSlider){
          this.$refs.rangeSlider.setRange([sPercentage, ePercentage]);
        }
      },



      
      // Makes sure the selected date is in range
      setSelStartDate: function(sDate){
        // Limit selected start date
        this.selStartDate = new Date(Math.max(this.limStartDate, sDate));
        // Set visible starting date one month before selected
        this.startDate = new Date(this.selStartDate.getTime());
        this.startDate.setMonth(this.startDate.getMonth() - 1);
        // Limit start date
        this.startDate = new Date(Math.max(this.limStartDate, this.startDate));
      },
      // Makes sure the selected date is in range
      setSelEndDate: function(eDate){
        // Limit selected end date
        this.selEndDate = new Date(Math.min(this.limEndDate, eDate));
        // Set visible starting date one month after selected
        this.endDate = new Date(this.selEndDate.getTime());
        this.endDate.setMonth(this.endDate.getMonth() + 1);
        // Limit end date
        this.endDate = new Date(Math.min(this.limEndDate, this.endDate));
      },

      

      // PUBLIC METHODS
      // Set the starting and ending dates
      // setSelectedStartEndDates: function(sDate, eDate){
      //   this.setSelStartDate(sDate);
      //   this.setSelEndDate(eDate);
      // },

      // Center the date on a specific date
      centerOnDate: function(cDate){
        let timespan = this.selEndDate.getTime() - this.selStartDate.getTime();
        let timeStart = cDate.getTime() - timespan/2;
        let timeEnd = cDate.getTime() + timespan/2;
        // If starting date is earlier than the limit, add this difference to the end time
        
        if (timeStart < this.limStartDate.getTime()){
          timeEnd += this.limStartDate.getTime() - timeStart;
        }
        // Same for ending date
        if (timeEnd > this.limEndDate.getTime()){
          timeStart -= timeEnd - this.limEndDate.getTime();
        }
        
        // Set starting and ending dates
        this.setSelStartDate(cDate.setTime(timeStart));
        

        this.setSelEndDate(cDate.setTime(timeEnd));

        // Set handles in range slider
        this.setRangeSlider();
        this.updateHTMLTimeline();
        // Emit selected dates. This updates the fishing hauls style
        this.$emit('changeSelDates', [this.selStartDate, this.selEndDate]);
    
      },

      // The side panel has been opened or closed. Update the month names. Called from Map.vue > AppManager.vue > AppSidePanel.vue
      onTabOpenClose: function(){
        this.setMonthNames();
      },




    },
    components: {
      'range-slider': RangeSlider
    },
    computed: {

    },
    
}
</script>




<style scoped>
.timeline {
  white-space: nowrap;
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 20px;

  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: rgb(149, 224, 255,0.9);
  
}

.hiddenClass {
  opacity: 0;
  border: none;
}

.monthButton, .yearButton{
  height: 100%;
  border: 1px solid #02488e33;
  background: none;
 
  -ms-user-select:none;
  -moz-user-select:none;
  -webkit-user-select:none;
  -webkit-touch-callout: none;
  -khtml-user-select: none;
  user-select:none;

  opacity: 1;
  transition: width 0.15s, opacity 0.5s;
}

.yearButton.even {
  background: rgba(0, 81, 255, 0.05);
}

.monthButton:hover,
.yearButton:hover {
  background: #e3f8ff7d;
}

.notextselect {
  user-select:none;
}

button {
  color:black;
  text-decoration: none;
}

.infoStartEndDate {
  font-size: 13px;
  /*width: fit-content;*/
  background: rgba(198, 239, 255, 0.8);
  border-top-right-radius: 0.2rem;
  border-top-left-radius: 0.2rem;

  border-right: 2px solid #02488e33;

  align-items: center;
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
}
</style>