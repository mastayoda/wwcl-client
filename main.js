/* Wait for Document to Load */
$(document).ready(function() {

    /* Enabling Copy & Paste */
    var gui = require('nw.gui');
    win = gui.Window.get();
    var nativeMenuBar = new gui.Menu({
        type: "menubar"
    });
    try {
        nativeMenuBar.createMacBuiltin("WorldWideCluster");
        win.menu = nativeMenuBar;
    } catch (ex) {
        console.log(ex.message);
    }
    /* Switching UI */
    switchScreen(1);

    /*  Initializing tabs */
    $("#tabs").tabs();

    /* Initialize Google Maps */
    var mapOptions = {
        center: {
            lat: -34.397,
            lng: 150.644
        },
        zoom: 1
    }
    window.gMap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    /* Initialize Table Sections */
    window.tblSdbxTable = $('#sandboxes').DataTable({
        "lengthMenu": [5],
        "bLengthChange": false,
        "oLanguage": {
            "sEmptyTable": "No Sandboxes Connected."
        }
    });

    $('#sandboxes tbody').on('click', 'tr', function() {
        $(this).toggleClass('selected');
    });
    window.tblSlctSdbxTable = $('#Selectedsandboxes').DataTable({
        "lengthMenu": [5],
        "bLengthChange": false,
        "oLanguage": {
            "sEmptyTable": "No Sandboxes selected."
        }
    });
    $('#Selectedsandboxes tbody').on('click', 'tr', function() {
        $(this).toggleClass('selected');
    });
    $("#btnAddToSelSdbx").button().click(function() {

        transferSelectedSandBoxes();

    });
    $("#btnSaveTopology").button().click(function() {
        addNewTopology();
        refreshTopologiesTable();
    });

    /* Tooltip Section */
    $(document).tooltip({
        items: "[box-id], [top-name], [top-name-sdbx],[job-name], [ex-job-name]",
        content: function() {
            var element = $(this);

            if (element.is("[box-id]")) {

                var id = element.attr('box-id');
                var box = avlbSandBoxes[id];
                return buildToolTip(box, true);

            } else if (element.is("[top-name]")) {

                var name = element.attr('top-name');
                var top = getTopologyFromArray(topologiesArr, name);

                return top.desc;

            } else if (element.is("[top-name-sdbx]")) {
                var name = element.attr('top-name-sdbx');
                var top = getTopologyFromArray(topologiesArr, name);

                return "Not Yet Implemented";

            } else if (element.is("[job-name]")) {
                var name = element.attr('job-name');
                var job = getJob(name);

                return job.desc;
            } else if (element.is("[ex-job-name]")) {
                var name = element.attr('ex-job-name');

                var job = getExJob(name);

                return job.desc;
            }
        }
    });

    /************************** DEPLOY SECTION *********************************/

    window.tblTopologies = $('#tblTopologies').DataTable({
        "lengthMenu": [3],
        "bLengthChange": false,
        "oLanguage": {
            "sEmptyTable": "No Topologies Created."
        },
        "tableTools": {
            "sRowSelect": "single"
        }
    });
    $('#tblTopologies tbody').on('click', 'tr', function() {

        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            tblTopologies.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }

        /* save selected topology object*/
        if (topologiesArr.length > 0) {
            var topologyName = this.children[0].innerHTML;
            selectedTopology = getTopologyFromArray(topologiesArr, topologyName);
        }

    });

    window.tblJobs = $('#tblJobs').DataTable({
        "lengthMenu": [5],
        "bLengthChange": false,
        "oLanguage": {
            "sEmptyTable": "No Jobs Created."
        }
    });
    $('#tblJobs tbody').on('click', 'tr', function() {

        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            tblJobs.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }

        /* Loading Job Form Data */
        if (savedJobsArr.length > 0) {
            var jobName = this.children[0].innerHTML;
            loadJobForm(jobName);

            /* If code window is open, set corresponding code */
            if (isEditorWinOpen)
                editWin.loadExternalCode(getJob(jobName));
        }

    });

    window.tblExampleJobs = $('#tblExampleJobs').DataTable({
        "lengthMenu": [5],
        "bLengthChange": false,
        "oLanguage": {
            "sEmptyTable": "No Jobs Created."
        }
    });
    $('#tblExampleJobs tbody').on('click', 'tr', function() {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            tblExampleJobs.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }

        /* Loading Job Form Data */
        if (exampleJobsArr.length > 0) {
            var jobName = this.children[0].innerHTML;
            loadExJobForm(jobName);

            /* If code window is open, set corresponding code */
            if (isEditorWinOpen)
                editWin.loadExternalCode(getExJob(jobName));
        }
    });
    $("#btnKernelAndParams").button().click(function() {

        window.editWin = window.open('kernelAndParams.html', {
            "position": "right",
            "height": 870,
            "focus": true,
            "toolbar": false,
            "frame": false,
            "resizable": false
        });

        /* Setting selected job into the new window */
        editWin.selectedJob = selectedJob;
        editWin.refWin = window;

        /* This function will be called from the code
         * editor window context.
         */
        editWin.saveJobCode = function(code) {
            parent.selectedJob.code = code;
            parent.setCodeIndicatorIcon(true);
            parent.isEditorWinOpen = false;
        };

        /*Set Open Window flag */
        isEditorWinOpen = true;

    });

    $("#btnCreateNewJob").button().click(function() {

        showMessage("You are now in the Create New Job mode. Note that if a job is selected from the table, you will be editing that job instead of creating a new one.");
        /* Reinitializing Current Selected job object */
        selectedJob = {};

        /* Clearing Form */
        $("#txtJobName").val("");
        $("#txtJobDesc").val("");
        setCodeIndicatorIcon(false);
        tblJobs.$('tr.selected').removeClass('selected');
    });

    $("#btnSaveJob").button().click(function() {
        SaveJob();
    });

    /* Window Closing Event */
    var gui = require('nw.gui');
    // Get the current window
    var win = gui.Window.get();

    /* On close save data */
    win.on('close', function() {
        /* Saving Topologies and Jobs back to localstorage */
        localStorage.setItem('topologies', JSON.stringify(topologiesArr));
        localStorage.setItem('jobs', JSON.stringify(savedJobsArr));

        this.close(true);
    });

    /* On error Handling */
    process.on("uncaughtException", function(e) {
        showError("An Error Ocurred! If this persist please restart the client. " + e.toString());
    });

    /* Extracting Dashboard Labels */
    window.lblSandBoxNum = $("#lblSandBoxNum");
    window.lblFlops = $("#lblFlops");
    window.lblMemory = $("#lblMemory");
    window.lblBrowserSdbx = $("#lblBrowserSdbx");
    window.lblNativeSdbx = $("#lblNativeSdbx");

    /* System Arrays */
    window.avlbSandBoxes = [];
    window.topologiesArr = [];
    window.slctTableArr = [];
    window.exampleJobsArr = [];
    window.savedJobsArr = [];
	window.runningJobs = [];

    /*Global Variables */
    window.selectedJob = {};
    window.selectedTopology = null;
    window.editWin = null;
    window.isEditorWinOpen = false;

    /* Restore Topologies */
    restoreTopologies();
    /* Load Job Examples */
    loadExamples();

    /* Restore Jobs */
    restoreJobs();
    refreshJobsTable();

    /* Initialize socket.io communication and data*/
    initializeSocketIO();
});

function loadExamples() {


    /* TODO: create example storage mechanism
    localStorage = require('localStorage');
    exampleJobsArr = localStorage.getItem("topologies");
    if (exampleJobsArr != null)
        exampleJobsArr = JSON.parse(topologiesArr);
    else
        exampleJobsArr = [];
    */

    /* Instantiate the json requester */
    window.jsonClient = require('request-json').newClient('https://raw.githubusercontent.com/mastayoda/wwcl-examples/master/');

    /* Request JSON example index array */
    jsonClient.get('exampleIndex.json', null, function(err, res, body) {

        var exIndexArr = body.arr;
        /* Get all examples */
        for (var i = 0; i < exIndexArr.length; i++) {
            console.log(exIndexArr[i]);
            jsonClient.get(exIndexArr[i], null, function(err, res, body) {

                var rawJob = body;
                var job = {};
                job.code = {};
                job.code.afterBarrierCode = rawJob.afBarrFunc;
                job.code.hasAfterBarrier = rawJob.hasAftBarr;
                job.code.isPartitioned = rawJob.isPartitioned;
                job.code.hasContext = rawJob.hasContext;
                job.code.context = rawJob.context;
                job.code.kernelCode = rawJob.kernel;
                job.code.paramsAndData = JSON.stringify(rawJob.params);

                job.name = rawJob.name;
                job.desc = rawJob.desc;

                exampleJobsArr.push(job);
                addJobToExampleTable(job);
            });
        }


    });

}

function loadJobForm(name) {

    var spn = $("#spnIndicator");
    var txtJobName = $("#txtJobName");
    var txtJobDesc = $("#txtJobDesc");
    var job = getJob(name);

    /* Setting Valid Code */
    setCodeIndicatorIcon(job.code !== undefined)

    /* Setting Data */
    txtJobName.val(job.name);
    txtJobDesc.val(job.desc);

    /* Setting Object */
    selectedJob = job;
}

function loadExJobForm(name) {

    var spn = $("#spnIndicator");
    var txtJobName = $("#txtJobName");
    var txtJobDesc = $("#txtJobDesc");
    var job = getExJob(name);

    /* Setting Valid Code */
    setCodeIndicatorIcon(job.code !== undefined)

    /* Setting Data */
    txtJobName.val(job.name);
    txtJobDesc.val(job.desc);

    /* This is the same but will just copy the job */
    selectedJob = {};
    selectedJob.code = job.code;
    selectedJob.code.isExample = true;
}

function DeployJob() {
    /* Execute Selected Job */
    if (selectedJob.name && selectedTopology) {

        /* Object for the whole job */
        var chance = require('chance').Chance();
        var jobObj = {};
        jobObj.sdbxs = [];
        jobObj.name = selectedJob.name;
        /* Partitioning variable, used to track the partitioning index range*/
        var partitiningIndex = 0;
        jobObj.clientSocketId = socketSessionID;
        jobObj.jobId = chance.guid();

        /* Extracting job dialog variables */
        var totalFlops = 0;
        var dspnJobName = $("#dspnJobName");
        var dspnJobDataPld = $("#dspnJobDataPld");
        var dspnJobKrnlPld = $("#dspnJobKrnlPld");
        var dspnJobParti = $("#dspnJobParti");
        var dspnTopoName = $("#dspnTopoName");
        var dspnTopoSdbxCount = $("#dspnTopoSdbxCount");
        var dspnTopoFLOPS = $("#dspnTopoFLOPS");

        /* Calculating the FLOPS and building sadboxes array */
        for (var i = 0; i < selectedTopology.sdbxs.length; i++) {
            if (selectedTopology.sdbxs[i].isPresent) {

                totalFlops += avlbSandBoxes[selectedTopology.sdbxs[i].id].sysInfo.pFlops;
                selectedTopology.sdbxs[i].pFlops = avlbSandBoxes[selectedTopology.sdbxs[i].id].sysInfo.pFlops;
            }
        }

        /* Sort Array descending by flops(faster sandboxes first) */
        if(selectedJob.code.isPartitioned) {
            selectedTopology.sdbxs.sort(sandboxSortArrayByFlops);
            var partitioningData = eval(selectedJob.code.paramsAndData);
            /* Copying object */
            var codeObj = $.extend({},selectedJob.code);
            codeObj.paramsAndData = {};
        }

        /* Create HashMap JobID -> result set, #sandbox, code barrier*/
        var rjobs = {};
        rjobs.hasAfterBarrier = selectedJob.code.hasAfterBarrier;
        if(selectedJob.code.hasAfterBarrier){
            rjobs.afterBarrierCode = selectedJob.code.afterBarrierCode;
        }
        rjobs.resultSet = [];
        rjobs.numSandbox = 0;

        /* Calculating total flops and sandboxes for the job*/
        for (var i = 0; i < selectedTopology.sdbxs.length; i++) {
            if (selectedTopology.sdbxs[i].isPresent) {
                /* Setting the sandbox properties */
                var sdbxObj = {};
                sdbxObj.clientSocketId = jobObj.clientSocketId;
                sdbxObj.sandboxSocketId = selectedTopology.sdbxs[i].id;
                sdbxObj.jobId = jobObj.jobId;

                /*Set #sandbox to wait for*/
                rjobs.numSandbox++;

                /* If data is partitioned, balance data assignment */
                if(selectedJob.code.isPartitioned)
                {
                    /* Copying the plain object */
                    sdbxObj.jobCode = $.extend({},codeObj);

                    /* Weighting sandbox data distribution by flops capacity */
                    var weight = Math.ceil(selectedTopology.sdbxs[i].pFlops/totalFlops * partitioningData.length);
                    /* Partitioning */
                    sdbxObj.jobCode.paramsAndData = JSON.stringify(partitioningData.slice(partitiningIndex,partitiningIndex + weight));
                    sdbxObj.jobCode.pRange = [partitiningIndex, partitiningIndex + sdbxObj.jobCode.paramsAndData.length];
                    /* Adding the sandbox */
                    jobObj.sdbxs.push(sdbxObj);

                    /* Deciding if continue or done with partitioning */
                    if(partitioningData.length  - (partitiningIndex + weight)> 0)
                        partitiningIndex += weight;
                    else
                        break;
                }
                else /* Just assign the data and push the sandbox */
                {
                    sdbxObj.jobCode = selectedJob.code;
                    /* Adding to the job's sandbox array */
                    jobObj.sdbxs.push(sdbxObj);
                }
            }
        }

        /*Set HashMap*/
        rjobs.isPartitioned = selectedJob.code.isPartitioned;   

        /* Setting dialog text */
        dspnJobName.html(selectedJob.name);
        dspnJobDataPld.html(JSON.stringify(selectedJob.code.paramsAndData).length + " bytes");
        dspnJobKrnlPld.html(JSON.stringify(selectedJob.code.kernelCode).length + " bytes");
        dspnJobParti.html(selectedJob.isPartitioned);
        dspnTopoName.html(selectedTopology.name);
        dspnTopoSdbxCount.html(selectedTopology.presentCount);
        dspnTopoFLOPS.html(totalFlops + " GFLOPS");

        window.djobObj = jobObj;

        /* Display Dialog */
        $("#dialog-deploy-job").dialog({
            resizable: false,
            modal: true,
            buttons: {
                "Yes": function() {

                    var randomnumber = Math.floor((Math.random()*100)+1);
                    var resWin = window.open('runningJob.html', "_blank",'PopUp',randomnumber, {
                        "position": "right",
                        "height": 535,
                        "width": 415,
                        "focus": true,
                        "toolbar": false,
                        "frame": false,
                        "resizable": false
                    });

                    /* Setting selected job into the new window */
                    rjobs.djobObj = $.extend({}, jobObj);
                    rjobs.djobObj.startTime = new Date();
                    rjobs.djobObj.hasContext = selectedJob.code.hasContext;
                    if(selectedJob.code.hasContext){
                       rjobs.djobObj.context = selectedJob.code.context;
                    }     
                    resWin.job = rjobs.djobObj;
                    resWin.refWin = window;
                    window.runningJobs[jobObj.jobId] = rjobs;

                    /* Adding Window Reference to the window */
                    window.runningJobs[jobObj.jobId].resWin = resWin;
                    window.runningJobs[jobObj.jobId].name =  rjobs.djobObj.name;

                    executeDeployment(rjobs.djobObj);
                    $(this).dialog("close");

                },
                "Cancel": function() {
                    delete rjobs;
                    $(this).dialog("close");
                }
            }
        });

    } else {
        showError("You must select a topology and a job before deploy.");
    }
}

function sandboxSortArrayByFlops(a,b)
{
    if (a.pFlops > b.pFlops)
        return -1;
    if (a.pFlops < b.pFlops)
        return 1;
    return 0;
}

function executeDeployment(jobObj) {
    socket.emit("jobDeploymentRequest", jobObj);
}

function SaveJob() {

    var spn = $("#spnIndicator");
    var txtJobName = $("#txtJobName");
    var txtJobDesc = $("#txtJobDesc");
    var isNew;

    /* Check if Code is valid */
    if (spn.attr("class") != "glyphicon glyphicon-ok-circle") {
        showError("Kernel & Parameters for this Job is are not valid, please make corrections.");
        return;
    }

    /* Check if Job name already exist */
    if (getJob(txtJobName.val().trim()) != null && selectedJob.name === undefined) {
        showError("A job with the same name already exist, please choose another job name, or edit the existing one.");
        return;
    }

    /* Restoring job */
    var job = selectedJob;
    var originalName = selectedJob.name;
    isNew = selectedJob.name === undefined;

    /* Updating Properties */
    job.name = txtJobName.val().trim();
    job.desc = txtJobDesc.val().trim();

    /* Storing or editing job */
    /* If a new job, create Object, if selected job, assign reference */
    if (isNew)
        savedJobsArr.push(job);
    else
        updateJob(job, originalName);

    /* Refreshing Local Storage */
    localStorage.setItem('jobs', JSON.stringify(savedJobsArr));
    /* Refresh Table */
    refreshJobsTable();

    /*Show save message */
    showMessage("Job sucessfully saved");
}

function updateJob(job, oName) {
    /* Searching Job*/
    for (var i = 0; i < savedJobsArr.length; i++) {
        /* Restore Jobs into the table */
        if (savedJobsArr[i].name == oName) {
            return savedJobsArr[i] = job;
        }
    }
    return;
}

function refreshJobsTable() {
    /*Clearing topologies table and rebuild*/
    tblJobs.clear().draw();
    restoreJobsTable();
}

function restoreJobsTable() {

    /* Restore Jobs into the table */
    for (var i = 0; i < savedJobsArr.length; i++) {

        /* Restore Jobs into the table */
        var job = savedJobsArr[i];

        /* Adding Job to the table */
        addJobToTable(job);
    }
}

function addJobToTable(job) {

    var data = [];

    /*The Job Name*/
    data[0] = job.name;
    /*The Job Description*/
    data[1] = "<button job-name='" + job.name + "' class='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only'>&nbsp;<span class='glyphicon glyphicon-eye-open'></span>&nbsp;</button>";
    /*The Job Delete Button */
    data[2] = "<button onClick='deleteJob(\"" + job.name + "\")' class ='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only'>&nbsp;<span class='glyphicon glyphicon-remove'></span>&nbsp;</button>";

    tblJobs.row.add(data).draw();
}

function addJobToExampleTable(job) {

    var data = [];

    /*The Job Name*/
    data[0] = job.name;
    /*The Job Description*/
    data[1] = "<button ex-job-name='" + job.name + "' class='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only'>&nbsp;<span class='glyphicon glyphicon-eye-open'></span>&nbsp;</button>";
    /*The Job Delete Button */

    tblExampleJobs.row.add(data).draw();
}

function getJob(jobName) {

    /* Searching Job*/
    for (var i = 0; i < savedJobsArr.length; i++) {
        /* Restore Jobs into the table */
        if (savedJobsArr[i].name == jobName)
            return savedJobsArr[i];
    }
    return null;
}

function getExJob(jobName) {

    /* Searching Job*/
    for (var i = 0; i < exampleJobsArr.length; i++) {
        /* Restore Jobs into the table */
        if (exampleJobsArr[i].name == jobName)
            return exampleJobsArr[i];
    }
    return null;
}

function deleteJob(jobName) {

    /* Set temporary job name variable */
    window.tJobName = jobName;

    $("#dialog-confirm-job").dialog({
        resizable: false,
        modal: true,
        buttons: {
            "Yes": function() {
                /* Deleting Topology */
                var name = window.tJobName;
                /* Deleting topology from array */
                deleteJobFromArray(name);
                /* Saving Topologies back to localstorage */
                localStorage.setItem('jobs', JSON.stringify(savedJobsArr));
                /* Refreshing topology table */
                refreshJobsTable();

                /* Clearing Form */
                $("#txtJobName").val("");
                $("#txtJobDesc").val("");
                setCodeIndicatorIcon(false);

                $(this).dialog("close");
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        }
    });
}

function showError(error) {

    $("#errorText").html(error);
    $("#dialogError").dialog({
        modal: false,
        buttons: {
            Ok: function() {
                $(this).dialog("close");
            }
        }
    });
}

function showMessage(msg) {
    $("#msgText").html(msg);
    $("#dialogMsg").dialog({
        modal: false,
        buttons: {
            Ok: function() {
                $(this).dialog("close");
            }
        }
    });
}

function setCodeIndicatorIcon(isValid) {

    var spn = $("#spnIndicator");

    if (isValid)
        spn.attr("class", "glyphicon glyphicon-ok-circle");
    else
        spn.attr("class", "glyphicon glyphicon-remove-circle");
}

function initializeSocketIO() {

    var io = require('socket.io-client');

    var sysInfo = dumpSystemInfo();

    window.socket = io.connect('https://wwcl-server-mastayoda1.c9.io', {
        query: 'isClient=' + true + '&' + 'sysInfo=' + JSON.stringify(sysInfo)
    });

    /* Connection succeed */
    socket.on('connect', function() {


        /* Reconnect Event */
        socket.on('reconnect', function() {

            socket.emit("requestSandBoxListing");
            showAlert('Reconnected!', "This client has been Reconnected, all data will be retrieved again.", false)

        });

        /* Disconnect handler */
        socket.on('disconnect', function() {

            clearAllData();
            showAlert('Connection Closed!', "This client has been disconnected, check your connection or try to restard the client.", false)

        });

        /* New Pipe Connected handler */
        socket.on('sandBoxConnected', function(sndbx) {

            var box = sndbx;
            avlbSandBoxes[box.id] = box;

            addSandBoxToMainTable(box);

            updateDashBoard(box, true);

            showAlert('New SandBox Connected!', "A new SandBox has join the cluster.", box, true);

        });

        /* New Pipe Disconnected handler */
        socket.on('sandboxDisconnected', function(sndbx) {

            sndbx = sndbx;

            updateDashBoard(avlbSandBoxes[sndbx.id], false)

            avlbSandBoxes.splice(avlbSandBoxes.indexOf(sndbx.id), 1);

            removeSandBoxFromMainTable(sndbx.id);

            refreshTopologiesTable();

            showAlert('SandBox Disconnected!', "SandBox " + sndbx.id + " has been disconnected.", true);

        });

        /* Receive pipeListing Handler */
        socket.on('reponseSandboxListing', function(data) {

            var connectedSndbx = data;


            for (var i = 0; i < connectedSndbx.length; i++) {
                avlbSandBoxes[connectedSndbx[i].id] = connectedSndbx[i];
            };

            for (var key in avlbSandBoxes) {
                addSandBoxToMainTable(avlbSandBoxes[key]);
                updateDashBoard(avlbSandBoxes[key], true)
            };

            showAlert('SandBoxes Added!', connectedSndbx.length + " SandBoxes have been added.", true);

            /* Restoring Topologies according to available sandboxes */
            restoreTopologiesTable();
        });

        /* Receive pipeListing Handler */
        socket.on('socketIDResponse', function(socketId) {
            /* Receiving socket id*/
            window.socketSessionID = socketId;
        });

        /* Receive Job Results */
        socket.on('jobExecutionResponse', function(results) {
            var rjobs = window.runningJobs[results.jobId];
            rjobs.resultSet.push(results.result);
            rjobs.numSandbox--;
            console.log(results);

            /* Updating corresponding result window */
            rjobs.resWin.changeReceived(1);
            rjobs.resWin.changePending(-1);

            if(rjobs.numSandbox == 0){
                if(rjobs.hasAfterBarrier){

                    var result = runAfterBarrier(rjobs);
                    showAlert("Job Done!",rjobs.name + " complete, verify result window." , true);
                    rjobs.resWin.jobCompleted(result);
                    rjobs.resWin.focus();
                }
                else{
                    result = rjobs.resultSet;
                    showAlert("Job Done!",rjobs.name + " complete, verify result window." , true);
                    rjobs.resWin.jobCompleted(result);
                    rjobs.resWin.focus();
                }
                result.jobId = results.jobId;
                console.log(result);
                delete rjobs;
            }

        });

        /* Receive Job Results */
        socket.on('jobExecutionErrorResponse', function(error) {
            console.log("WHY ERROR?!?!");
            var rjobs = window.runningJobs[results.jobId];
            rjobs.numSandbox--;
            rjobs.resWin.changeErrors(1);
            rjobs.resWin.changePending(-1);
            if(rjobs.numSandbox == 0){
                if(rjobs.hasAfterBarrier){

                    var result = runAfterBarrier(rjobs);
                    showAlert("Job Done!",rjobs.name + " complete, verify result window." , true);
                    rjobs.resWin.jobCompleted(result);
                    rjobs.resWin.focus();
                }
                else{
                    result = rjobs.resultSet;
                    showAlert("Job Done!",rjobs.name + " complete, verify result window." , true);
                    rjobs.resWin.jobCompleted(result);
                    rjobs.resWin.focus();
                }
                result.jobId = results.jobId;
                console.log(result);
                delete rjobs;
            }
            console.log(error);
        });

        /* Request Pipe listing */
        socket.emit("requestSandBoxListing");
        /* Request other end socket ID */
        socket.emit("requestSocketID");

    });
}

function runAfterBarrier(job)
{
    try {
        var resultArr = [];

        if(job.isPartitioned)
        {
            /* If partitioned clean results into regular array */
            for(var i =0;i<job.resultSet.length;i++)
            {
                for(var j =0;j<job.resultSet[i].length;j++)
                {
                    resultArr.push(job.resultSet[i][j].result);
                }
            }

        }
        else /* Just pass the collected results */
            resultArr = job.resultSet;

        /* Building function */
        var avFunc = eval("b=function(resultsArr){var resultbkp=resultsArr.slice(0);var result='';try{" + job.afterBarrierCode + "}catch(ex){return{\"e\":'Error Ocurred, Returning previous data(resultArr).'+ex.toString(),\"r\":resultbkp}}if(result==='')return{\"e\":'result variable not set! Returning previous data(resultArr).',\"r\":resultbkp};else return{\"e\":'',\"r\":result};}");
        var result =  avFunc(resultArr);
        return result;
    } catch (ex) {
        showError("Your <b>After Barrier</b> code is not valid, please make corrections and try again.\n\n" + ex);
        return job.resultSet;
    }
}

function exitClient() {
    /* Exiting process */
    window.close();
}

function getTopologyFromArray(arr, name) {

    for (var i = 0; i < arr.length; i++) {
        if (arr[i].name == name)
            return arr[i];
    }

    return null;
}

function deleteTopologyFromArray(name) {

    for (var i = 0; i < topologiesArr.length; i++) {
        if (topologiesArr[i].name == name) {
            topologiesArr.splice(i, 1);
            return;
        }
    }
}

function deleteJobFromArray(name) {

    for (var i = 0; i < savedJobsArr.length; i++) {
        if (savedJobsArr[i].name == name) {
            savedJobsArr.splice(i, 1);
            return;
        }
    }
}

function restoreTopologies() {

    window.localStorage = require('localStorage');
    /* Restoring topolgoies */
    topologiesArr = localStorage.getItem("topologies");
    if (topologiesArr != null)
        topologiesArr = JSON.parse(topologiesArr);
    else
        topologiesArr = [];
}

function restoreJobs() {

    window.localStorage = require('localStorage');
    /* Restoring topolgoies */
    savedJobsArr = localStorage.getItem("jobs");
    if (savedJobsArr != null)
        savedJobsArr = JSON.parse(savedJobsArr);
    else
        savedJobsArr = [];
}

function restoreTopologiesTable() {

    /* Restore Topologies into the table */
    for (var i = 0; i < topologiesArr.length; i++) {

        /* Getting Current Topology Reference */
        var top = topologiesArr[i];

        /* Assuming that all sandboxes are present */
        top.presentCount = top.sdbxs.length;

        /* Verifying topology Sandboxes presense */
        for (var j = 0; j < top.sdbxs.length; j++) {
            if (avlbSandBoxes[top.sdbxs[j].id] == undefined) {
                top.hasMissingSdbxs = true;
                top.sdbxs[j].isPresent = false;
                top.presentCount--;
            }
        }
        /* Checking wich topologies are missing */
        addTopologyToTopologyTable(top);
    }
}

function refreshTopologiesTable() {
    /*Clearing topologies table and rebuild*/
    tblTopologies.clear().draw();
    restoreTopologiesTable();
}

function addTopologyToTopologyTable(top) {

    var data = [];

    /*The Topology Name*/
    data[0] = top.name;
    /*The Topology Description*/
    data[1] = "<button top-name='" + top.name + "' class='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only'>&nbsp;<span class='glyphicon glyphicon-eye-open'></span>&nbsp;</button>";
    /*The Topology SandBoxes*/
    data[2] = top.presentCount + '/' + top.sdbxs.length;
    /*The Topology is Complete?*/
    data[3] = (!top.hasMissingSdbxs) ? "<span class='glyphicon glyphicon-ok'></span>" : "<span class='glyphicon glyphicon-remove'></span>";

    data[4] = /*"<button onClick='editTopology(this)' class ='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only'>&nbsp;<span class='glyphicon glyphicon-pencil'></span>&nbsp;</button>"; +*/
        "<button onClick='removeTopology(this)' class ='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only'>&nbsp;<span class='glyphicon glyphicon-remove'></span>&nbsp;</button>";

    tblTopologies.row.add(data).draw();
}

function removeTopology(row) {

    /* Storing temporary topology Name */
    window.tTopologyName = row.parentElement.parentElement.children[0].innerHTML;

    $("#dialog-confirm").dialog({
        resizable: false,
        modal: true,
        buttons: {
            "Yes": function() {
                /* Deleting Topology */
                var name = window.tTopologyName;
                /* Deleting topology from array */
                deleteTopologyFromArray(name);
                /* Saving Topologies back to localstorage */
                localStorage.setItem('topologies', JSON.stringify(topologiesArr));
                /* Refreshing topology table */
                refreshTopologiesTable();

                /* If deleted topology was the selected one,
                 * set selected topology to null */
                if (selectedTopology != null) {
                    if (selectedTopology.name == name)
                        selectedTopology = null;
                }

                $(this).dialog("close");
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        }
    });
}

function addNewTopology() {

    /* Getting fields */
    var topologyName = $("#txtTopName");
    var topologyDesc = $("#txtTopDesc");

    /* Creating the new topology */
    var nTopology = Topology(topologyName.val(), topologyDesc.val(), slctTableArr);

    /* Storing topologies */
    topologiesArr.push(nTopology);

    /* Saving Topologies back to localstorage */
    localStorage.setItem('topologies', JSON.stringify(topologiesArr));

    /* Clear fields and table */
    topologyName.val("");
    topologyDesc.val("");

    /* Clear table */
    tblSlctSdbxTable.clear().draw();

    /* clear array */
    slctTableArr = [];
}

function Topology(name, desc, sdbxArr) {

    var topo = {};

    topo.name = name;
    topo.desc = desc;
    topo.sdbxs = [];
    topo.created = new Date();
    topo.modified = null;
    topo.hasMissingSdbxs = false;
    topo.presentCount = 0;

    for (key in sdbxArr) {
        var sdbx = {};
        sdbx.id = key;
        sdbx.isPresent = true;
        sdbx.lastDatePresent = new Date();
        //sdbx.sysInfo = avlbSandBoxes[sdbx.id].sysInfo;
        topo.sdbxs.push(sdbx)
    }

    /* Setting present count */
    topo.presentCount = topo.sdbxs.length;

    return topo;
}

function updateDashBoard(sdbx, isAdding) {
    var oneGB = 1000000000;

    if (isAdding) {

        lblSandBoxNum.html(Number(lblSandBoxNum.html()) + 1);
        lblFlops.html((Number(lblFlops.html()) + sdbx.sysInfo.flops).toFixed(2));

        if (sdbx.sysInfo.isNodeJS)
            lblMemory.html((Number(lblMemory.html()) + sdbx.sysInfo.totalmem / oneGB).toFixed(2));

        if (sdbx.sysInfo.isNodeJS) {
            lblNativeSdbx.html(Number(lblNativeSdbx.html()) + 1);
            var img = 'assets/img/nativeMini.png';
        } else {
            lblBrowserSdbx.html(Number(lblBrowserSdbx.html()) + 1);
            var img = 'assets/img/browserMini.png';
        }

        /* Adding Google Map Marker */
        var ll = new google.maps.LatLng(sdbx.sysInfo.geo.ll[0], sdbx.sysInfo.geo.ll[1]);
        var marker = new google.maps.Marker({
            position: ll,
            title: sdbx.id,
            //icon: img
        });
        /* Adding infoWindow to map markers */
        var infowindow = new google.maps.InfoWindow({
            content: buildToolTip(sdbx, false)
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(gMap, marker);
        });

        marker.setMap(gMap);
        sdbx.sysInfo.mapMarker = marker;

    } else {
        lblSandBoxNum.html(Number(lblSandBoxNum.html()) - 1);
        lblFlops.html((Number(lblFlops.html()) - sdbx.sysInfo.flops).toFixed(2));
        lblMemory.html((Number(lblMemory.html()) - sdbx.sysInfo.totalmem / oneGB).toFixed(2));

        if (sdbx.sysInfo.isNodeJS)
            lblNativeSdbx.html(Number(lblNativeSdbx.html()) - 1);
        else
            lblBrowserSdbx.html(Number(lblBrowserSdbx.html()) - 1);

        /* Removing Google Maps Marker */
        sdbx.sysInfo.mapMarker.setMap(null);
    }
}

function buildToolTip(sdbx, isTableTooltip) {
    var content = "";

    switch (sdbx.sysInfo.platform) {
        case 'darwin':
            img = 'assets/img/mac.png'
            break;
        case 'linux':
            img = 'assets/img/linux.png'
            break;
        case 'win32':
            img = 'assets/img/windows.png'
            break;
    }

    if (isTableTooltip) {
        content = "<img class='map' src='https://maps.googleapis.com/maps/api/staticmap?" +
            "center=" + sdbx.sysInfo.geo.ll[0] + "," + sdbx.sysInfo.geo.ll[1] +
            "&zoom=2&size=280x100&markers=color:red%7C" + sdbx.sysInfo.geo.ll[0] + "," + sdbx.sysInfo.geo.ll[1] +
            "'/>" +
            "<br>" +
            "<br>";
    }
    console.log(sdbx);

    if (sdbx.sysInfo.isNodeJS)
        content += "<ul>" +
        "<li>" + "<img src='" + img + "'/>" + "</li>" +
        "<li>" + "<b>CPU:</b> " + sdbx.sysInfo.cpu.model + " x " + sdbx.sysInfo.cpu.cores + "</li>" +
        "<li>" + "<b>Architecture:</b> " + sdbx.sysInfo.arch + "</li>" +
        "<li>" + "<b>Memory:</b> " + (sdbx.sysInfo.totalmem / 1000000000).toFixed(2) + " GB</li>" +
        "<li>" + "<b>Platform:</b> " + sdbx.sysInfo.platform + "</li>" +
        "<li>" + "<b>OS:</b> " + sdbx.sysInfo.type + " </li>" +
        "<li>" + "<b>FLOPS:</b> " + sdbx.sysInfo.flops + " GFLOPS</li>" +
        "<ul>";
    else
        content += "<ul>" +
        "<li>" + "<img src='" + img + "'/>" + "</li>" +
        "<li>" + "<b>Browser:</b> " + sdbx.sysInfo.browserInfo[0] + " " + sdbx.sysInfo.browserInfo[1] + "</li>" +
        "<li>" + "<b>Platform:</b> " + sdbx.sysInfo.platform + "</li>" +
        "<li>" + "<b>FLOPS:</b> " + sdbx.sysInfo.flops + " GFLOPS</li>" +
        "<ul>";


    return content;
}

function clearAllData() {

    /*Clear all data */
    tblSdbxTable.clear().draw();
    tblSlctSdbxTable.clear().draw();
    /* Clear all map markers */
    for (var i = 0; i < avlbSandBoxes.length; i++) {
        avlbSandBoxes[i].sysInfo.mapMarker.setMap(null);
    }
    /* Clear arrays */
    avlbSandBoxes = [];
    slctTableArr = [];

    /* Clear dashboard */
    lblSandBoxNum.html(0);
    lblFlops.html(0);
    lblMemory.html(0);
    lblNativeSdbx.html(0);
    lblBrowserSdbx.html(0);
}

function addSandBoxToMainTable(sdbx) {
    var data = [];

    /*Sandbox ID*/
    data[0] = sdbx.id;
    /*Sandbox type*/
    data[1] = (sdbx.sysInfo.isNodeJS) ? "Native" : "Browser";
    /*Sandbox type*/
    data[2] = sdbx.sysInfo.flops;

    var uptm = secondsToTime(sdbx.sysInfo.uptime);

    data[3] = uptm.h + ":" + uptm.m + ":" + uptm.s;

    data[4] = "<button box-id='" + sdbx.id + "' class='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only'>&nbsp;<span class='glyphicon glyphicon-eye-open'></span>&nbsp;</button>";

    tblSdbxTable.row.add(data).draw();
}


function removeSandBoxFromMainTable(id) {

    var index = -1;
    tblSdbxTable.rows().indexes().each(function(idx) {

        var d = tblSdbxTable.row(idx).data();
        if (d[0] == id)
            index = idx;

    });

    /* If row is found */
    if (index > -1)
        tblSdbxTable.row(index).remove().draw(false);
}

function removeSandBoxFromSelectedTable(row) {

    var id = row.parentNode.parentNode.childNodes[0].innerHTML;
    var index = -1;
    tblSlctSdbxTable.rows().indexes().each(function(idx) {

        var d = tblSlctSdbxTable.row(idx).data();
        if (d[0] == id)
            index = idx;

    });

    /* If row is found */
    if (index > -1) {
        tblSlctSdbxTable.row(index).remove().draw(false);

        /* Removing from quick array Hash */
        delete slctTableArr[id];
    }
}

function transferSelectedSandBoxes() {

    var slctdArr = tblSdbxTable.row('.selected');

    for (var i = 0; i < slctdArr[0].length; i++) {
        var data = tblSdbxTable.row(slctdArr[0][i]).data();

        /* If hash array contains this sandbox key, skip adding this one */
        if (slctTableArr[data[0]])
            continue;

        var sdbxObj = [data[0], data[1], "<button onClick='removeSandBoxFromSelectedTable(this)' class ='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only'>&nbsp;<span class='glyphicon glyphicon-remove'></span>&nbsp;</button>"];
        tblSlctSdbxTable.row.add(sdbxObj).draw();
        slctTableArr[data[0]] = true;

    };
}

function switchScreen(idx) {
    switch (idx) {
        case 1:
            $("#dashboard").fadeIn();
            $("#createTopology").hide();
            $("#deploy").hide();
            break;
        case 2:
            $("#dashboard").hide();
            $("#createTopology").fadeIn();
            $("#deploy").hide();
            break;
        case 3:
            $("#dashboard").hide();
            $("#createTopology").hide();
            $("#deploy").fadeIn();
            break;
    }
}

function showAlert(tittle, text, isPositive) {

    var img = (isPositive) ? "announcement-positive.png" : "announcement-negative.png";
    var unique_id = $.gritter.add({
        title: tittle,
        text: text,
        image: 'assets/img/' + img,
        sticky: false,
        time: '5000',
        class_name: 'my-sticky-class'
    });

    return false;
}

/* Get Object with all system Specifications */
function dumpSystemInfo() {

    var os = require('os');
    var specs = {};

    specs.cpu = os.cpus()[0];
    delete specs.cpu.times;
    specs.cpu.cores = os.cpus().length;
    specs.arch = os.arch();
    specs.freemem = os.freemem();
    specs.hostname = os.hostname();
    specs.platform = os.platform();
    specs.totalmem = os.totalmem();
    specs.type = os.type();
    specs.uptime = os.uptime();
    specs.publicIP = getClientIP();
    specs.flops = 1;
    specs.isNodeJS = typeof exports !== 'undefined' && this.exports !== exports;

    var ifaces = os.networkInterfaces();
    var innterArr = [];
    var isBehindNat = true;

    for (var dev in ifaces) {
        ifaces[dev].forEach(function(details) {
            if (details.family == 'IPv4') {

                /* Check if behind NAT */
                if (specs.publicIP == details.address)
                    isBehindNat = false;

                innterArr.push({
                    'dev': dev,
                    'address': details.address
                });
            }
        });
    }
    specs.isBehindNAT = isBehindNat;
    specs.networkInterfaces = innterArr;
    return specs;
}

function getClientIP() {
    if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
    else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

    xmlhttp.open("GET", "http://api.hostip.info/get_html.php", false);
    xmlhttp.send();

    hostipInfo = xmlhttp.responseText.split("\n");

    for (i = 0; hostipInfo.length >= i; i++) {
        ipAddress = hostipInfo[i].split(":");
        if (ipAddress[0] == "IP") return ipAddress[1];
    }

    return false;
}

function secondsToTime(secs) {
    secs = Math.round(secs);
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
    };
    return obj;
}
