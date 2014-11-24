$(document).ready(function () {

    /* Ends With prototype */
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

    /* Setting UI Information */
    $("#lblJobName").html(window.job.name);
    $("#tdStartTime").html(window.job.startTime.toUTCString());
    $("#tdJobName").html(window.job.name);
    $("#tdRunningSdbxs").html(window.job.sdbxs.length);
    $("#tdPending").html(window.job.sdbxs.length);

    /* Setting Internal Information */
    window.job.pending = window.job.sdbxs.length;
    window.job.errors = 0;
    window.job.aborted = 0;
    window.job.received = 0;

    /* Execution Time Timer */
    window.timer = setInterval(function () {

        $("#tdExecTime").html( Number($("#tdExecTime").html())+1);
    }, 1000);

    /* Resizing Window */
    window.resizeTo(600, 550);
});


function changePending(n)
{
    window.job.pending+= n;
    window.$("#tdPending").html(window.job.pending);
}

function changeErrors(n)
{
    window.job.errors += n;
    window.$("#tdErrors").html(window.job.errors);
}

function changeAborted(n)
{
    window.job.aborted += n;
    window.$("#tdAborted").html(window.job.aborted);
}

function changeReceived(n)
{
    window.job.received += n;
    window.$("#tdReceived").html(window.job.received);
}

function jobCompleted(results)
{
    /* Storing results and stopping timer */
    window.job.results =  results;
    window.clearInterval(window.timer);

    /* Showing save and close buttons */
    window.$("#btnCloseDiv").show();
    window.$("#divSaveBtn").show();

    /* Hidding loading gif, showing save gif */
    window.$("#gifLoading").hide();
    window.$("#gifSave").show();

    var now = new Date();
    $("#tdFinishTime").html(now.toUTCString());

}

function closeJobWindow() {

    window.close();
}

function saveResults() {
    chooseFile('#fileDialog');
}

function chooseFile(name) {
    var chooser = $(name);
    chooser.attr("nwsaveas",window.job.name + "_" + "results.json")

    chooser.change(function (evt) {
        var fs = require('fs');

        var fileName = $(this).val();
        if(!fileName.endsWith(".json"))
            fileName += ".json";

        /* Writing results */
        fs.writeFile(fileName, JSON.stringify(window.job.results, null, 4));

    });

    chooser.trigger('click');
}
