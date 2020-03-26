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
                isCheck: false,
                type: 'checkbox',
                value: false
            },
            {
                name: 'check data',
                isCheck: true,
                type: 'checkbox',
                value: true
            }
        ],
        minichartOptions:{
            inputs:{
                labels: '',
                values: ''
            }
        },
        buttons: {
            typeOfChart: [
                {
                    text: 'Bars',
                    state: true
                },
                {
                    text: 'Pie',
                    state: true
                }
            ],
            loadChart : [
                {
                    id: 'chart-bar',
                    class: 'addChartBar',
                    function: 'loadPresets',
                    text: 'Launch chart',
                    state: true
                },
                {
                    id: 'chart-pie',
                    class: 'addChartPie',
                    function: 'loadPresets',
                    text: 'Launch chart Pie',
                    state: false
                }
            ],
            columnSelector:[
                {
                    id: 'labels',
                    class: 'select',
                    text: 'First input - Choose your labels',
                    options: []
                },
                {
                    id: 'values',
                    class: 'select',
                    text: 'Second input - Choose your values',
                    options: []
                }
            ]
        },
        messages: [
            {
                id: 'msg0',
                type: 'message is-warning',
                icon: {
                    name: 'exclamation-circle',
                    size: 'fa-2x'
                },
                title: 'Review your data.',
                msg: [
                    {
                        p: 'You may want to review the data from your file. It seems there are "empty" values/cells.'
                    }
                ],
                buttons: [
                    { txt: 'OK' }
                ]
            },
            {
                id: 'msg1',
                type: 'message is-warning',
                icon: {
                    name: 'file-excel',
                    size: 'fa-2x'
                },
                title: 'Not supported file',
                msg: [
                    {
                        p: 'Please, upload only comma separated files (csv).'
                    },
                    {
                        p: 'What is a csv file?',
                        class: 'p-subtitle'
                    },
                    {
                        p: 'A comma-separated values file is a delimited text file that uses a comma to separate values. Each line of the file is a data record. Each record consists of one or more fields, separated by commas.'
                    }
                ],
                buttons: [
                    { txt: 'OK' }
                ]
            },
            {
                id: 'msg2',
                type: 'message is-info',
                icon: {
                    name: 'file-excel',
                    size: 'fa-2x'
                },
                title: 'Loads of data!',
                msg: [
                    {
                        p: 'The app does not support files bigger than 100Kb.'
                    },
                    {
                        p: 'Let\'s keep it simple!',
                        class: 'p-subtitle'
                    },
                    {
                        p: 'This web application has been designed to support basic data charts created with small amount of data. Please, simplify your csv file or just select a different data file.'
                    }
                ],
                buttons: [
                    { txt: 'OK' }
                ]
            },
            {
                id: 'msg3',
                type: 'notification is-primary is-light is-promise',
                icon: {
                    name: 'exclamation-circle',
                    size: 'fa-2x'
                },
                title: 'Review your data.',
                msg: [
                    {
                        p: 'Content loaded succesfully!'
                    }
                ],
                buttons: [
                    { txt: 'OK' }
                ]
            },
            {
                id: 'msg4',
                type: 'message is-warning',
                icon: {
                    name: 'file-excel',
                    size: 'fa-2x'
                },
                title: 'Invalid selection',
                msg: [
                    {
                        p: 'Labels and values are using the same column input.'
                    },
                    {
                        p: 'Please, select different columns for each of the elements.'
                    }
                ],
                buttons: [
                    { txt: 'OK' }
                ]
            }
        ],
        showLaunch: false,
        showBarchart: {
            btn: false,
            graphic: false
        },
        dataFile: null,
        validExtension: ['csv'],
        modalStatus: {
            value: false
        },
        notificationStatus: {
            value: false
        }
    },
    mutations: {
        loadDataFile(state, payload) {


            /* 
             FORMAT TABLE VALIDATION
             ============================
            * This function is called after the dataArray has been created and validates the format.
            */

            const validateFormat = (_data, _options, target) => {

                // isVal false by default
                let isVal = false

                // defined maximun items in row
                let maxItemsRow = 0;

                // Iterate throug the parsed options and check if validation is active
                _options.forEach(option => {
                    isVal = option.name === target && option.isCheck ? true : false;
                })

                // If validation is active
                if (isVal) {

                    // Check if empty rows
                    _data.forEach(row => {
                        row.length >= maxItemsRow ?
                            maxItemsRow = row.length :
                            console.warn('There are empty cells. Max number of cells per row are ' + maxItemsRow);

                        //Activate message 0 -> empty cells
                        state.modalStatus.id = 'msg0',
                            state.modalStatus.value = true,
                            state.modalStatus.params = maxItemsRow
                    })

                } else {
                    // Validation has not been activated
                    console.log("%c Validation has NOT been activated ", "color:black; background: orange")
                }

            }


            /* 
             TABLE BUILDER
             ============================
            * Checks if the payload contains data.
            * Check if the file extension is the correct one (csv)
            * Builds an array with the cells matched by regex:
                * > Uses commas to divide cells
                * > Kepps double quotes inside cell
            * Adds lazy loading if the csv file is too big
            */

            // Payload => false
            if (!payload) {
                state.dataFile = payload;
            }
            // Payload => true
            else {

                // File Size
                let _fileSize = payload.size
                let _passMark = 100000  // Customized value


                /* ==== FILE EXTENSION
                * > Retrieves file extension and checks if is correct 
                * > Extension = EXT
                * > Two values => OK / NOT accepted
                */

                let _fileExtension = payload.name.split('.').pop().toLowerCase(); // retrieves extension file
                let extensionSuccess = state.validExtension.indexOf(_fileExtension); // compares agaisnt accepted extensions
                extensionSuccess != -1 ? extensionSuccess = true : extensionSuccess = false; // returns true if accepted




                /**** EXT ==> NOT Accepted */
                if (!extensionSuccess) {
                    state.modalStatus.id = 'msg1', //Activate message 1 -> format file
                    state.modalStatus.value = true
                } 
                /**** FILE SIZE ==> NOT Accepted */
                else if (_fileSize >= _passMark ){
                    state.modalStatus.id = 'msg2', //Activate message 2 -> file size
                    state.modalStatus.value = true

                    return false; // Stop process here!

                }
                /**** EXT ==> OK Accepted */
                else {


                    /* ==== LAZY LOADING 
                    * > Gets file size
                    * > IF biggers than passMark ==> Lazy loading ACTIVE
                    */

                    // If FilzeSize is bigger than 10000 - activate lazy loader
                    //   _fileSize > _passMark ? 
                    //   alert(_fileSize, "Activate lazy loader") : false;


                    /* ================ DATA PROCESS - START! ==== */

                    // Creates dataArray to deploy the final data
                    const dataArray = []

                    // Lets split the data by rows
                    let rows = payload.result.split("\n");

                    // Filter empty rows or null values
                    rows = rows.filter(item => {
                        return (item != null || item != "")
                    })


                    // iterate through the rows
                    rows.forEach((cell, index) => {

                        // make it a string for Regex
                        let _cell = cell.toString();

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
                        if (_cell != null) {
                            // push the data cell
                            dataArray.push(_cell);
                        }


                        /* ================ DATA PROCESS - END ==== */

                        /* Define a new promise - loading notification astate asynchronous*/
                        const showNotification = (msgID, stateValue, ms) => new Promise(resolve => {
                            setTimeout(() => {
                                state.notificationStatus.id = msgID, state.notificationStatus.value = stateValue
                            }, ms);
                            resolve();
                        });


                        // Check if the loop has ended
                        if(index === (rows.length) - 1){

                            /* 
                            ===== > Shows notification - PROMISE
                            ** Call a specific notification in asynchronous way
                            * > Call showNotification function and parse --> message ID || notification status value || timing
                            * > Then call itself but parse 'false' as stateValue to hide the message
                            * > For showing -> factor fo 1000 ms
                            * > For hiding -> use a factor of 0.3 ms
                            */
                            showNotification('msg3', true, _fileSize/2000).then(() => {
                                showNotification('msg3', false, _fileSize/0.3)
                            })

                        }

                    })



                    // Validates format table
                    validateFormat(dataArray, state.inputOptions, 'check data');



                    /* 
                    STORE STATE UPDATE
                    ============================
                    * mutates the state of the dataFile with dataArray values
                    */
                    console.table(dataArray);
                    state.dataFile = dataArray;

                }

            }
            // End of Payload => true

        },
        showLaunch(state, payload) {
            state.showLaunch = payload
        },
        showChartBar(state, payload) {
            state.showBarchart.graphic = payload
        },
        updateOptions(state, payload) {
            const allOptions = state.inputOptions;

            allOptions.forEach(option => {
                option.name === payload.name ?
                    option.isCheck = payload.value : option.isCheck
            })
        },
        addOptions(state, payload){
           // Retrieves the current minchart inputs
            const chartInputs = state.minichartOptions.inputs;

            // Creates an array of keys based on minichart inputs object
            let _inputs = Object.keys(chartInputs)


            /* Iterates through each key 
            * Checks if key matches the payload name
            * If true, update the value in the charInputs object
            * Otherwise just return the current value of the chartInpust object
            */
            _inputs.forEach(item => {
                item === payload.name ? chartInputs[payload.name] = payload.value : chartInputs[item]
            });

            chartInputs.labels === chartInputs.values ? 
            [state.modalStatus.id = 'msg4', state.modalStatus.value = true] : 
            false



        },
        resetModal(state, payload) {
            state.modalStatus.value = payload;
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
        getMessages(state) {
            return state.messages
        },
        getModalStatus(state) {
            return state.modalStatus
        },
        getNotificationStatus(state) {
            return state.notificationStatus
        },
        getChartBar(state) {
            return state.showBarchart.graphic
        },
        getButtonLib(state){
            return state.buttons
        },
        getMiniChart(state){
            return state.minichartOptions
        }
    },
    actions: {
        addFile(context, payload) {
            context.commit('loadDataFile', payload);
        },
        addLaunchBtn(context, payload) {
            context.commit('showLaunch', payload);
        },
        updateValues(context, payload) {
            context.commit('updateOptions', payload);
        },
        createOptions(context, payload) {
            context.commit('addOptions', payload);
        },
        closeModal(context, payload) {
            context.commit('resetModal', payload)
        },
        addChartBar(context, payload) {
            context.commit('showChartBar', payload);
        }

    }
})