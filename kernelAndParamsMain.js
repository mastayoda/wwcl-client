/* Wait for Document to Load */
$(document).ready(function() {

    /* Array for executing sandboxes */
    window.executingSdbxs = [];

    window.kernelEditor = CodeMirror.fromTextArea(document.getElementById("kernelCode"), {
        lineNumbers: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete"
        },
        mode: {
            name: "javascript",
            globalVars: true
        },
        gutters: ["CodeMirror-lint-markers", "CodeMirror-foldgutter"],
        lineWrapping: true,
        extraKeys: {
            "Ctrl-Q": function(cm) {
                cm.foldCode(cm.getCursor());
            },

            "Ctrl-Space": "autocomplete"

        },
        foldGutter: true,
        lint: true,
        theme: "mdn-like",
        styleActiveLine: true,
        matchBrackets: true
    });

    window.reduceEditor = CodeMirror.fromTextArea(document.getElementById("reduceCode"), {
        lineNumbers: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete"
        },
        mode: {
            name: "javascript",
            globalVars: true
        },
        gutters: ["CodeMirror-lint-markers", "CodeMirror-foldgutter"],
        lineWrapping: true,
        extraKeys: {
            "Ctrl-Q": function(cm) {
                cm.foldCode(cm.getCursor());
            },

            "Ctrl-Space": "autocomplete"

        },
        foldGutter: true,
        lint: true,
        theme: "mdn-like",
        styleActiveLine: true,
        matchBrackets: true
    });

    window.afterBarrierEditor = CodeMirror.fromTextArea(document.getElementById("afterBarrierCode"), {
        lineNumbers: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete"
        },
        mode: {
            name: "javascript",
            globalVars: true
        },
        gutters: ["CodeMirror-lint-markers", "CodeMirror-foldgutter"],
        lineWrapping: true,
        extraKeys: {
            "Ctrl-Q": function(cm) {
                cm.foldCode(cm.getCursor());
            },

            "Ctrl-Space": "autocomplete"

        },
        foldGutter: true,
        lint: true,
        theme: "mdn-like",
        styleActiveLine: true,
        matchBrackets: true
    });

    window.paramsEditor = CodeMirror.fromTextArea(document.getElementById("paramCode"), {
        lineNumbers: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete"
        },
        mode: "application/json",
        gutters: ["CodeMirror-lint-markers", "CodeMirror-foldgutter"],
        lineWrapping: true,
        extraKeys: {

            "Ctrl-Q": function(cm) {
                cm.foldCode(cm.getCursor());
            },

            "Ctrl-Space": "autocomplete"

        },
        foldGutter: true,
        lint: true,
        theme: "mdn-like",
        styleActiveLine: true,
        matchBrackets: true
    });


    $("#btnTestKernel").button().click(function() {

        var Parallel = require('paralleljs');
        var check = require('syntax-error');

        var kCode = kernelEditor.getValue().trim();
        var pCode = paramsEditor.getValue().trim();
        var avCode = afterBarrierEditor.getValue().trim();
        var isPartitioned = false;
        var func = '',
            avFunc = '';

        /* Validating the Parameter Object */
        try {
            var paramOrData = eval(JSON.parse(pCode));
        } catch (ex) {
            showError("Your <b>parameter</b> code is not valid, please make corrections and try again.\n\n" + ex);
            return;
        }

        /* Validating the Parameter Object */
        if ($("#chkPartitionData").is(':checked') && !(paramOrData instanceof Array) ) {
            showError("Arrays as <b>parameter</b> is only permited in partitioned mode, if the same array will be passed to all sandboxes, wrap it in a JSON object, Eg. { \"arr\": [1,2,3] }");
            return;
        }

        /* Validating the Parameter Object */
        if (!$("#chkPartitionData").is(':checked') && (paramOrData instanceof Array) ) {
            showError("Partitioned data requires an array as parameter. Eg. [1,2,3,4]");
            return;
        }

        /* Partitioned Data Selected */
        if ($("#chkPartitionData").is(':checked')) {

            /* If not instance of Array */
            if (!(paramOrData instanceof Array)) {
                showError("Partitioning is selected, your <b>parameter</b> code must be an <b>Array</b>, remember that each element will be partitioned between Sandboxes.");
                return;
            } else if (paramOrData.length < 1) {
                showError("Partitioning is selected, your <b>parameter</b> <b>Array</b> must contain at least one element.");
                return;
            }

            isPartitioned = true;
        }


        /* Validating Kernel Syntax */
        var err = check(kCode);
        if (err) {
            showError("Your <b>Kernel</b> code is not valid, please make corrections and try again.\n\n" + err);
            return;
        }

        /* Validating Kernel */
        if (kCode == "") {
            showError("<b>Kernel</b> function is required!");
            return;
        }

        try {
            /* Building function */
            func = eval("a=function(params){result='result variable not set!';try{" + kCode + "}catch(ex){result=ex.toString();}params.result = result;return params;}");
        } catch (ex) {
            showError("Your <b>Kernel</b> code is not valid, please make corrections and try again.\n\n" + ex);
            return;
        }

        /* Validating After Barrier Function if Selected */
        if ($("#chkTogleAfterBarrier").is(':checked') && avCode !== '') {

            var err = check(avCode);
            if (err) {
                showError("Your <b>After Barrier</b> code is not valid, please make corrections and try again.\n\n" + err);
                return;
            }

            try {
                /* Building function */
                avFunc = eval("b=function(resultsArr){var resultbkp=resultsArr.slice(0);var result='';try{" + avCode + "}catch(ex){return{\"e\":'Error Ocurred, Returning previous data(resultArr).'+ex.toString(),\"r\":resultbkp}}if(result==='')return{\"e\":'result variable not set! Returning previous data(resultArr).',\"r\":resultbkp};else return{\"e\":'',\"r\":result};}");
            } catch (ex) {
                showError("Your <b>After Barrier</b> code is not valid, please make corrections and try again.\n\n" + ex);
                return;
            }
        }


        /* Hidding result section */
        $("#divExecResults").hide();
        $("#imgLoading").show();

        /* Showing dialog*/
        $("#results").dialog({
            modal: false,
            buttons: {
                Ok: function() {
                    $(this).dialog("close");
                }
            }
        });

        /* Registering sandbox */
        var sdbxReference = {
            "id": "686agtdf7at",
            "timeout": 50,
            "hasAfterBarrier": avFunc !== "",
            "avFunc": avFunc
        };

        /* Global executing jobs array */
        executingSdbxs[sdbxReference.id] = sdbxReference;

        /* Adding reference to sandbox object */
        var params = {};

        /* Executing the function */
        if(isPartitioned) {
            /* Execute with only one element */
            params.sdbxRef = sdbxReference;
            params.data = paramOrData[0];
            /* Creating the SandBox*/
            var p = new Parallel(params);
            p.spawn(func).then(testKernelResults);
        }
        else
        {
            /* Execute with only one element */
            params.sdbxRef = sdbxReference;
            params.data = paramOrData;
            /* Creating the SandBox*/
            var p = new Parallel(params);
            p.spawn(func).then(testKernelResults);
        }

        /* timer to monitor execution time */
        window.timer = setInterval(function() {
            var ct = $("#spnTimer").html();
            $("#spnTimer").html(Number(ct) + 1);
        }, 1000);

    });

    $("#chkTogleReduceFunction").button().click(function() {

        $("#reducetd").toggle();

    });

    $("#chkTogleAfterBarrier").button().click(function() {

        $("#afterBarriertd").toggle();

    });

    $("#chkPartitionData").button().click(function() {

        /* Partitioned Data Selected */
        if ($("#chkPartitionData").is(':checked')) {
            /* Parameter code */
            var pCode = paramsEditor.getValue().trim();
            /* Validating the Parameter Object */
            try {
                var paramOrData = eval(JSON.parse(pCode));
            } catch (ex) {
                showError("Your <b>parameter</b> code is not valid, please make corrections and try again.\n\n" + ex);
                return;
            }

            /* If not instance of Array */
            if (!(paramOrData instanceof Array)) {
                showError("Your <b>parameter</b> code must be an <b>Array</b>, remember that each element will be partitioned between Sandboxes.");
            } else if (paramOrData.length < 1) {
                showError("Your <b>parameter</b> <b>Array</b> must contain at least one element.");
            } else {
                showInformation("Your partitioned <b>parameter</b> <b>Array</b> looks Ok, you can proceed.");
            }
        } else {
            showInformation("Partition Option Deselected, each sandbox will receive the same parameter object.");
        }
    });

    $("#chkReadFromFile").button().click(function() {

        /* Partitioned Data Selected */
        if ($("#chkReadFromFile").is(':checked')) {
            /* Parameter code */
            var pCode = paramsEditor.getValue().trim();
            /* Validating the Parameter Object */
            try {
                var paramOrData = eval(JSON.parse(pCode));
            } catch (ex) {
                showError("Your <b>parameter</b> code is not valid, please make corrections and try again.\n\n" + ex);
                return;
            }
            /* If not instance of Array */
            if ( !("file" in paramOrData) || !("lines" in paramOrData)) {
                showError("Your <b>parameter</b> code must be an <b>Object</b>, must contain properties file and lines.");
            } else if (isNaN(paramOrData.lines)) {
                showError("Property'lines' must be a valid number.");
            } else {
                showInformation("Your parameter file Object looks Ok, you can proceed.");
            }
        } else {
            showInformation("Data File Option Deselected, use partition or single data options.");
        }
    });

    $("#btnKernelHelp").button().click(function() {

        $("#kernel-Help").dialog({
            modal: false,
            width: 600,
            buttons: {
                Ok: function() {
                    $(this).dialog("close");
                }
            }
        });

    });

    $("#btnDataParamHelp").button().click(function() {

        $("#params-Help").dialog({
            modal: false,
            width: 600,
            buttons: {
                Ok: function() {
                    $(this).dialog("close");
                }
            }
        });

    });

    /* Set data if Available */
    if (selectedJob.code !== undefined) {

        kernelEditor.setValue(selectedJob.code.kernelCode);
        if(selectedJob.code.reduceCode)
            reduceEditor.setValue(selectedJob.code.reduceCode);
        paramsEditor.setValue(selectedJob.code.paramsAndData);
        afterBarrierEditor.setValue(selectedJob.code.afterBarrierCode);

        if(selectedJob.code.hasReduce)
        {
            $("#reducetd").toggle();
            reduceEditor.focus();
            kernelEditor.focus();

            $("#chkTogleReduceFunction").prop( "checked", true );
        }

        if(selectedJob.code.hasAfterBarrier)
        {
            $("#afterBarriertd").toggle();
            afterBarrierEditor.focus();
            kernelEditor.focus();

            $("#chkTogleAfterBarrier").prop( "checked", true );
        }

        if(selectedJob.code.isPartitioned)
        {
            $("#chkPartitionData").prop( "checked", true );
        }
        else
            $("#chkPartitionData").prop( "checked", false );

        if(selectedJob.code.readFromDisk)
        {
            $("#chkReadFromFile").prop( "checked", true );
        }
        else
            $("#chkReadFromFile").prop( "checked", false );

        if (selectedJob.code.isExample)
            formatExample();


    }

    /* On error Handling */
    process.on("uncaughtException", function(e) {
        showError("An Error Ocurred! If this persist please restart the client. " + e.toString());
    });

});

function testKernelResults(execResults) {

    /* if results from kernel function is undefined
     * something went terrible wrong, return
     */
    if (execResults == undefined) {

        $("#spnResults").html("Kernel function returned undefined, please double check your code and remember that return statements are not allowed.");
        $("#results").dialog({
            modal: false,
            buttons: {
                Ok: function() {
                    $(this).dialog("close");
                }
            }
        });
        return;
    }

    /* Getting the sandbox Reference */
    var sdbxRef = execResults.sdbxRef;
    /* Reasigning the results */
    var result = execResults.result;

    /* If After Barrier Function, execute it */
    if (sdbxRef.hasAfterBarrier) {
        result = executingSdbxs[sdbxRef.id].avFunc([result]);
        /* if results from barrief function is undefined
         * something went terrible wrong, return
         */
        if (result == undefined) {

            /* Stop timer and reset*/
            window.clearInterval(window.timer);
            $("#spnTimer").html("0");

            /* Hidding wait and show results section */
            $("#spnResults").html("After Barrier function returned undefined, please double check your code and remember that return statements are not allowed.");
            $("#divExecResults").show();
            $("#imgLoading").hide();

            $("#results").dialog({
                modal: false,
                buttons: {
                    Ok: function() {
                        $(this).dialog("close");
                    }
                }
            });
            return;
        }
    }

    /* Stop timer and reset*/
    window.clearInterval(window.timer);
    $("#spnTimeElapsed").html($("#spnTimer").html());
    $("#spnTimer").html("0");
    /* Hidding wait and show results section */
    $("#divExecResults").show();
    $("#imgLoading").hide();

    /* If barrier, show this results */
    if (sdbxRef.hasAfterBarrier) {
        /* If not error ocurred */
        if (result.e == "")
            $("#spnResults").html(JSON.stringify(result.r));
        else
            $("#spnResults").html(result.e + " : " + JSON.stringify(result.r));

    } /* if not barrier, show straigth results */
    else {
        $("#spnResults").html(JSON.stringify(result));
    }

    $("#results").dialog({
        modal: false,
        buttons: {
            Ok: function() {
                $(this).dialog("close");
            }
        }
    });
}

function saveCode() {

    var check = require('syntax-error');
    var kCode = kernelEditor.getValue().trim();
    var rCode = reduceEditor.getValue().trim();
    var pCode = paramsEditor.getValue().trim();
    var avCode = afterBarrierEditor.getValue().trim();
    var avFunc = "";
    var isPartitioned = false;
    var isUsingFile = false;

    /* Validating the Parameter Object */
    try {
        var paramOrData = eval(JSON.parse(pCode));
    } catch (ex) {
        showError("Your <b>parameter</b> code is not valid, please make corrections and try again.\n\n" + ex);
        return;
    }

    /* Validating Kernel */
    if (kCode == "") {
        showError("<b>Kernel</b> function is required!");
        return;
    }
    /* Validating kernel syntax */
    var err = check(kCode);
    if (err) {
        showError("Your <b>Kernel</b> code is not valid, please make corrections and try again.\n\n" + err);
        return;
    }


    try {
        /* Building function */
        func = eval("a=function(params){result='result variable not set!';try{" + kCode + "}catch(ex){result=ex.toString();}params.result = result;return params;}");
    } catch (ex) {
        showError("Your <b>Kernel</b> code is not valid, please make corrections and try again.\n\n" + ex);
        return;
    }

        /* Validating reduce Function if Selected */
    if ($("#chkTogleReduceFunction").is(':checked') && rCode !== '') {

        var err = check(rCode);
        if (err) {
            showError("Your <b>Reduce</b> code is not valid, please make corrections and try again.\n\n" + err);
            return;
        }
    }

    /* Validating After Barrier Function if Selected */
    if ($("#chkTogleAfterBarrier").is(':checked') && avCode !== '') {

        var err = check(avCode);
        if (err) {
            showError("Your <b>After Barrier</b> code is not valid, please make corrections and try again.\n\n" + err);
            return;
        }

        try {
            /* Building function */
            avFunc = eval("b=function(resultsArr){var resultbkp=resultsArr.slice(0);var result='';try{" + avCode + "}catch(ex){return{\"e\":'Error Ocurred, Returning previous data(resultArr).'+ex.toString(),\"r\":resultbkp}}if(result==='')return{\"e\":'result variable not set! Returning previous data(resultArr).',\"r\":resultbkp};else return{\"e\":'',\"r\":result};}");
        } catch (ex) {
            showError("Your <b>After Barrier</b> code is not valid, please make corrections and try again.\n\n" + ex);
            return;
        }
    }

    /* Partitioned Data Selected */
    if ($("#chkPartitionData").is(':checked')) {

        /* If not instance of Array */
        if (!(paramOrData instanceof Array)) {
            showError("Partitioning is selected, your <b>parameter</b> code must be an <b>Array</b>, remember that each element will be partitioned between Sandboxes.");
            return;
        } else if (paramOrData.length < 1) {
            showError("Partitioning is selected, your <b>parameter</b> <b>Array</b> must contain at least one element.");
            return;
        }

        isPartitioned = true;
    }

        /* Partitioned Data Selected */
    if ($("#chkReadFromFile").is(':checked')) {

        /* If not instance of Array */
        if (!(paramOrData instanceof Object)) {
            showError("Partitioning is selected, your <b>parameter</b> code must be an <b>Object</b>, remember that line ranges will be partitioned between Sandboxes.");
            return;
        } else if ( !("file" in paramOrData) || !("lines" in paramOrData)) {
            showError("Your <b>parameter</b> code must be an <b>Object</b>, must contain properties file and lines.");
            return;
        } else if (isNaN(paramOrData.lines)) {
            showError("Property'lines' must be a valid number.");
            return;
        }

        isUsingFile = true;
    }

    /* Setting Job Code and save */
    var jobCode = {
        "kernelCode": kCode,
        "reduceCode": rCode,
        "paramsAndData": pCode,
        "isPartitioned": isPartitioned,
        "readFromDisk": isUsingFile,
        "hasAfterBarrier": avFunc !== "",
        "hasReduce": rCode !== "",
        "afterBarrierCode": avCode
    };
    window.saveJobCode(jobCode);
    closeAndSetFlag();
}

function closeAndSetFlag() {
    window.refWin.isEditorWinOpen = false;
   this.window.close();
}


function loadExternalCode(jobCode) {

    /* Reseting Data */
    window.selectedJob.code = jobCode.code;
    if(window.selectedJob.code.reduceCode)
        window.reduceEditor.setValue(window.selectedJob.code.reduceCode);
    window.kernelEditor.setValue(window.selectedJob.code.kernelCode);
    window.paramsEditor.setValue(window.selectedJob.code.paramsAndData);
    window.afterBarrierEditor.setValue(window.selectedJob.code.afterBarrierCode);

    if(window.selectedJob.code.hasReduce)
        window.$("#chkTogleReduceFunction").prop( "checked", true );

    if(window.selectedJob.code.hasAfterBarrier)
        window.$("#chkTogleAfterBarrier").prop( "checked", true );

    if(window.selectedJob.code.isPartitioned)
        window.$("#chkPartitionData").prop( "checked", true );

    if(window.selectedJob.code.readFromDisk)
        window.$("#chkReadFromFile").prop( "checked", true );

    if (window.selectedJob.code.isExample)
        window.formatExample();

}

function showError(error) {

    $("#syntaxErrorMsg").html(error);
    $("#codeError").dialog({
        modal: false,
        buttons: {
            Ok: function() {
                $(this).dialog("close");
            }
        }
    });
}

function showInformation(msg) {

    $("#attMsgText").html(msg);
    $("#attMsg").dialog({
        modal: false,
        buttons: {
            Ok: function() {
                $(this).dialog("close");
            }
        }
    });
}

function getSelectedRange(cm) {
    return {
        from: cm.getCursor(true),
        to: cm.getCursor(false)
    };
}

function autoFormatSelection(cm) {
    var range = getSelectedRange(cm);
    cm.autoFormatRange(range.from, range.to);
}

function formatExample() {
    window.kernelEditor.execCommand("selectAll");
    window.autoFormatSelection(kernelEditor);
    window.kernelEditor.execCommand("goLineRight");
    window.paramsEditor.execCommand("selectAll");
    window.autoFormatSelection(paramsEditor);
    window.paramsEditor.execCommand("goLineRight");
    window.afterBarrierEditor.execCommand("selectAll");
    window.autoFormatSelection(afterBarrierEditor);
    window.afterBarrierEditor.execCommand("goLineRight");
    window.kernelEditor.execCommand("selectAll");
    window.autoFormatSelection(kernelEditor);
    window.kernelEditor.execCommand("goLineRight");
}
