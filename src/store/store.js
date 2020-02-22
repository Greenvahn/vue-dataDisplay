import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        title: 'Data display',
        description: 'A single-page application to display your .csv files.',
        instructions: {
            main: 'Start by loading your csv file. After that, press on "launch" button to display the data.',
            button: 'launch'
        },
        inputOptions: [
            {
                name: 'has header',
                isCheck: false
            },
            {
                name: 'check data',
                isCheck: false
            }
        ],
        messages: [
            {
                id: 'msg0',
                msg: 'The CSV has empty cells. It could be missing data.',
                isActive: false
            }
        ],
        showLaunch: false,
        dataFile: null,
    },
    mutations: {
        loadDataFile(state, payload) {

            if (!payload) {
                state.dataFile = payload;
            } else {
                // Retrieves all options
                const allOptions = state.inputOptions;

                // Creates empty array
                const dataArray = []

                // Validation - defined maximun items in row
                let maxItemsRow = 0;

                // Check if validation is active
                const validateCells = (_data, _options, target) =>{
                    let isVal;
                    _options.forEach(option =>{
                       isVal = option.name === target && option.isCheck ? true : false;
                    })

                    if(isVal){
                        _data.forEach(row => {
                            row.length >= maxItemsRow ?
                            maxItemsRow = row.length : console.warn('There are empty cells. Max number of cells per row are ' + maxItemsRow)
                        })
                    } else{
                        console.log("%c Validation has NOT been activated ", "color:black; background: orange")
                    }
                }

                // Lets split the data by rows
                let rows = payload.split("\n");

                // Filter empty rows or null values
                rows = rows.filter(item => {
                    return (item != null || item != "")
                })


                // iterate through the rows
                rows.forEach((cell, index) => {


                    // make it a string for Regex
                    let _cell= cell.toString();

                    console.log("before"+index, _cell);

                    // Includes commas inside of double quotes
                    _cell = _cell.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
                    /* will match:
                        (
                            ".*?"       double quotes + anything but double quotes + double quotes
                            |           OR
                            [^",\s]+    1 or more characters excl. double quotes or comma
                        )
                        (?=             FOLLOWED BY
                            \s*,        0 or more empty spaces and a comma
                            |           OR
                            \s*$        0 or more empty spaces and nothing else (end of string)
                        )

                    */

                    // Do not push if cell is null
                    if(_cell != null){

                        console.log("item"+index, _cell);

                        // push the data cell
                        dataArray.push(_cell);
                    }


                })

                validateCells(dataArray, allOptions, 'check data');


                // mutates dataFile state with dataArray values
                console.table(dataArray);
                state.dataFile = dataArray;

            }

        },
        showLaunch(state, payload) {
            state.showLaunch = payload
        },
        updateOptions(state, payload) {
            const allOptions = state.inputOptions;

            allOptions.forEach(option =>{
                option.name === payload.name ?
                option.isCheck = payload.value : option.isCheck
            })
        }
    },
    getters: {
        getTable(state) {
            return state.dataFile
        },
        getButton(state) {
            return state.showLaunch
        },
        getInputOptions(state) {
            return state.inputOptions
        },
        getMessage(state) {
            return state.messages
        }
    },
     actions :{
        addFile(context, payload){
            context.commit('loadDataFile', payload);
        },
        addLaunchBtn(context, payload){
            context.commit('showLaunch', payload);
        },
        updateValues(context, payload){
            context.commit('updateOptions', payload);
        }

    }
})