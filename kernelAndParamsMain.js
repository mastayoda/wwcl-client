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
        if (!$("#chkTogleAfterBarrier").is(':checked') && paramOrData instanceof Array) {
            showError("Arrays as <b>parameter</b> is only permited in partitioned mode, if the same array will be passed to all sandboxes, wrap it in a JSON object, Ex. { \"arr\": [1,2,3] }");
            return;
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

        /* Registering into the runnint sandboxes */
        executingSdbxs[sdbxReference.id] = sdbxReference;

        /* Adding reference to sandbox object */
        paramOrData.sdbxRef = sdbxReference;

        /* Creating the SandBox*/
        var p = new Parallel(paramOrData);

        /* Executing the function */
        p.spawn(func).then(function(execResults) {

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
        });

        /* timer to monitor execution time */
        window.timer = setInterval(function() {
            var ct = $("#spnTimer").html();
            $("#spnTimer").html(Number(ct) + 1);
        }, 1000);

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
        paramsEditor.setValue(selectedJob.code.paramsAndData);
        afterBarrierEditor.setValue(selectedJob.code.afterBarrierCode);
    }

    /* On error Handling */
    process.on("uncaughtException", function(e) {
        showError("An Error Ocurred! If this persist please restart the client. " + e.toString());
    });

});

function saveCode() {

    var check = require('syntax-error');
    var kCode = kernelEditor.getValue().trim();
    var pCode = paramsEditor.getValue().trim();
    var avCode = afterBarrierEditor.getValue().trim();
    var avFunc = "";
    var isPartitioned = false;

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

    /* Setting Job Code and save */
    var jobCode = {
        "kernelCode": kCode,
        "paramsAndData": pCode,
        "isPartitioned": isPartitioned,
        "hasAfterBarrier": avFunc !== "",
        "afterBarrierCode": avCode
    };
    window.saveJobCode(jobCode);
    closeAndSetFlag();
}

function closeAndSetFlag() {
    window.refWin.isEditorWinOpen = false;
    window.close();
}


function loadExternalCode(jobCode) {

    /* Reseting Data */
    window.selectedJob.code = jobCode.code;
    window.kernelEditor.setValue(window.selectedJob.code.kernelCode);
    window.paramsEditor.setValue(window.selectedJob.code.paramsAndData);
    window.afterBarrierEditor.setValue(window.selectedJob.code.afterBarrierCode);

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
