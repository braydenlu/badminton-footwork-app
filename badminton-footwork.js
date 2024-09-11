var mode;
var doFootwork = false;
var stopSwitch = false;

var decreaseInterval;
var variablePace;
var lateAdjustment;
var stackAdjustments;
var lateAdjustments = 0;
var infiniteRally;
var disabledCornerArray = [];
var activeCornerArray = [];
var footworkTimeout;
var progressCircleRadius = parseInt(getComputedStyle(document.getElementById('progress-circle')).getPropertyValue('--radius'));

document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('click', toggleStopSwitch);
    const decreaseIntervalCheckbox = document.getElementById('decrease-interval');
    const variablePaceCheckbox = document.getElementById('variable-pace');
    const lateAdjustmentCheckbox = document.getElementById('late-adjustment');
    const stackAdjustmentCheckbox = document.getElementById('stack-adjustments');
    const infiniteRallyCheckbox = document.getElementById('infinite-rally');

    decreaseInterval = decreaseIntervalCheckbox.checked;
    variablePace = variablePaceCheckbox.checked;
    lateAdjustment = lateAdjustmentCheckbox.checked;
    stackAdjustments = stackAdjustmentCheckbox.checked;
    infiniteRally = infiniteRallyCheckbox.checked;

    decreaseIntervalCheckbox.addEventListener('change', () => {
        decreaseInterval = decreaseIntervalCheckbox.checked;
    });
    variablePaceCheckbox.addEventListener('change', () => {
        variablePace = variablePaceCheckbox.checked;
    });
    lateAdjustmentCheckbox.addEventListener('change', () => {
        lateAdjustment = lateAdjustmentCheckbox.checked;
    });
    stackAdjustmentCheckbox.addEventListener('change', () => {
        stackAdjustments = stackAdjustmentCheckbox.checked;
    });
    infiniteRallyCheckbox.addEventListener('change', () => {
        infiniteRally = infiniteRallyCheckbox.checked;
    });

    var savedMode = localStorage.getItem('mode');
    if (savedMode !== null) {
        mode = parseInt(savedMode);
        var radioButtons = document.getElementsByName('mode');
        for (i = 0; i < radioButtons.length; i++) {
            if (parseInt(radioButtons[i].value) === mode) {
                radioButtons[i].checked = true;
            }
        }
        applyMode();
    } else {
        mode = 0;
    }

    document.getElementById('mode').addEventListener('change', () => {
        var radioButtons = document.getElementsByName('mode');
        for (i = 0; i < radioButtons.length; i++) {
            if (radioButtons[i].checked) {
                mode = parseInt(radioButtons[i].value);
            }
        }
        localStorage.setItem('mode', mode);

        applyMode();
    });
});

function applyMode() {
    switch (mode) {
        case 0:
            document.getElementById("late-container").style.display = "none";
            document.getElementById("timer-container").style.display = "block";
            break;
        case 1:
            document.getElementById("late-container").style.display = "flex";
            document.getElementById("timer-container").style.display = "block";
            break;
        case 2:
            document.getElementById("late-container").style.display = "none";
            document.getElementById("timer-container").style.display = "none";
            break;
        case 3:
            break;
        default:
            alert('default');
    }
}

function closeControls() {
    document.getElementById("controls-container").style.display = "none";
}

function openControls() {
    document.getElementById("controls-container").style.display = "block";
}

function toggleCorner(corner) {
    if (!doFootwork) {
        corner.classList.toggle("selected-corner");
    }
}

var maxRallyLength;
var currentRallyLength;

function start() {
    switch (mode) {
        case 0:
        case 1:
            disabledCornerArray = [];
            activeCornerArray = [];
            currentRallyLength = 0;
            var interval = parseInt(document.getElementById('timer-number').value);
            var variableNumber = parseInt(document.getElementById('variable-number').value);
            maxRallyLength = parseInt(document.getElementById('rally-length').value);
            var i = 1;
            for (const corner of Array.from(document.getElementsByClassName("corner"))) {
                if (corner.classList.contains("selected-corner")) {
                    activeCornerArray.push(i);
                } else {
                    disabledCornerArray.push(corner);
                }
                i++;
            }
            if (activeCornerArray.length != 0) {
                toggleVisibleElements();
                doFootwork = true;
                for (const corner of disabledCornerArray) {
                    corner.classList.toggle("hidden");
                }
                footworkLoop(interval, variableNumber);
            }
            break;
        case 2:
            break;
        case 3:
            break;
        default:
    }
}

function footworkLoop(interval, variableNumber) {
    if (decreaseInterval) {
        interval -= document.getElementById('decrease-interval-number').value / document.getElementById('rally-length').value;
    }
    if (!infiniteRally) {
        currentRallyLength++;
    }
    if (variablePace) {
        if (Math.random() < 0.5) {
            interval += Math.floor(Math.random() * variableNumber);
        } else {
            interval -= Math.floor(Math.random() * variableNumber);
        }
    }
    startAnimating(interval, variableNumber);
}

var startTime;
var stopSwitch = false;

function startAnimating(interval, variableNumber) {
    var cornerNumberToHighlight = activeCornerArray[Math.floor(Math.random() * activeCornerArray.length)];

    var rectangle = document.getElementById("rectangle" + cornerNumberToHighlight);
    var rectangleClone = document.getElementById("rectangle" + (cornerNumberToHighlight + 8));
    var innerRectangle = document.getElementById("rectangle" + (cornerNumberToHighlight + 8) + "inner");
    var rectangleComputedTransform = getComputedStyle(rectangle).transform;
    var rectangleCloneComputedTransform = getComputedStyle(rectangleClone).transform;

    var rectangleOriginalTransform = getOriginalTransform(rectangle);
    var rectangleCloneOriginalTransform = getOriginalTransform(rectangleClone);
    var innerRectangleOriginalTransform;
    if (innerRectangle != null) {
        innerRectangleOriginalTransform = getOriginalTransform(innerRectangle);
    }

    var animation;
    var stopAnimating = stopSwitch;
    var preAnimationLength = 200;
    var oppositeTransformOriginSwitch = false;
    var preAnimationReset = false;

    var oppositeTransformOrigin = getOppositeTransformOrigin(cornerNumberToHighlight);
    var originalTransformOrigin = getOriginalTransformOrigin(cornerNumberToHighlight);

    function animate(currentTime) {
        if (startTime === undefined) {
            startTime = currentTime;
        }
        const elapsed = currentTime - startTime;

        setTimer(interval - elapsed);

        // reset block
        if (!doFootwork || (elapsed > interval && mode == 0) || (stopAnimating != stopSwitch && mode == 1)) {
            startTime = undefined;
            rectangle.style.transform = rectangleOriginalTransform;
            rectangleClone.style.transform = rectangleCloneOriginalTransform;
            if (innerRectangle != null) {
                innerRectangle.style.transform = innerRectangleOriginalTransform;
            }
            rectangleClone.style.transformOrigin = originalTransformOrigin;
            document.getElementById("progress-circle").style.strokeDashoffset = 0;
            if (mode == 1 && elapsed > interval && lateAdjustment) {
                console.log("late adjustment");
                if (stackAdjustments || lateAdjustments == 0) {
                    interval += parseInt(document.getElementById("late-number").value);
                    lateAdjustments++;
                }
            } else if (lateAdjustments > 0) {
                lateAdjustments--;
                interval -= parseInt(document.getElementById("late-number").value);
            }
            if (animation) {
                cancelAnimationFrame(animation);
            }
            if (doFootwork) {
                recurse(interval, variableNumber);
            }
            console.log(interval);
            return;
        } else {
            // Loading circle
            if (elapsed / interval < 1) {
                document.getElementById("progress-circle").style.strokeDashoffset = 2 * progressCircleRadius * Math.PI * (elapsed / interval);
            } else {
                document.getElementById("progress-circle").style.strokeDashoffset = 2 * progressCircleRadius * Math.PI * 1.01;
            }

            if (elapsed < preAnimationLength) {
                if (elapsed > preAnimationLength / 2) {
                    if (!oppositeTransformOriginSwitch) {
                        switch (cornerNumberToHighlight) {
                            case 2:
                            case 4:
                            case 5:
                            case 7:
                                rectangleClone.style.transformOrigin = oppositeTransformOrigin;
                            default:
                        }
                        oppositeTransformOriginSwitch = true;
                    }
                    switch (cornerNumberToHighlight) {
                        case 1:
                        case 3:
                        case 6:
                        case 8:
                            innerRectangle.style.transform = `scaleY(${1 - ((elapsed - preAnimationLength / 2) / (preAnimationLength / 2))})`;
                            break;
                        case 2:
                        case 7:
                            rectangleClone.style.transform = `scaleY(${1 - ((elapsed - preAnimationLength / 2) / (preAnimationLength / 2))})`;
                            break;
                        default:
                            rectangleClone.style.transform = `scaleX(${1 - ((elapsed - preAnimationLength / 2) / (preAnimationLength / 2))})`;
                    }
                } else {
                    scaleRectangle(rectangleClone, (elapsed / (preAnimationLength / 2)), cornerNumberToHighlight, rectangleCloneComputedTransform);
                }

                // Regular rectangle starting animation
                scaleRectangle(rectangle, elapsed / preAnimationLength, cornerNumberToHighlight, rectangleComputedTransform);

                // Main animation
            } else if (elapsed < interval) {
                if (!preAnimationReset) {
                    switch (cornerNumberToHighlight) {
                        case 1:
                        case 3:
                        case 6:
                        case 8:
                            innerRectangle.style.transform = '';
                            rectangleClone.style.transform = "scaleY(0)";
                            animationStage = 2;
                            break;
                        default:
                            rectangleClone.style.transformOrigin = originalTransformOrigin;
                            animationStage = 2;
                            scale = 1;
                    }
                }
                scaleRectangle(rectangle, 1 - ((elapsed - preAnimationLength) / (interval - preAnimationLength)), cornerNumberToHighlight, rectangleComputedTransform);
            }
        }
        if (doFootwork) {
            animation = requestAnimationFrame(animate);
        }
    }

    animation = requestAnimationFrame(animate);
}

function setTimer(timeLeft) {
    if (timeLeft < 0) {
        timeLeft = 0;
    }
    var startText = "";
    var middleText = "";
    var endText = "";
    var minutes = Math.floor(timeLeft / 1000 / 60);
    if (minutes < 10) {
        startText += "0";
    }
    var seconds = Math.floor(timeLeft / 1000);
    if (seconds < 10) {
        middleText += "0";
    }
    var milliseconds = Math.floor(timeLeft % 1000);
    if (milliseconds < 10) {
        endText += "0";
    }
    if (milliseconds < 100) {
        endText += "0";
    }
    document.getElementById("timer").innerHTML = startText + minutes + ":" + middleText + seconds + "." + endText + milliseconds;
}

function recurse(interval, variableNumber) {
    if (doFootwork && currentRallyLength < maxRallyLength) {
        stopSwitch = false;
        footworkLoop(interval, variableNumber);
        console.log("current rally length:" + currentRallyLength);
    } else {
        stop();
    }
}

function getOriginalTransformOrigin(cornerNumberToHighlight) {
    switch (cornerNumberToHighlight) {
        case 1:
        case 2:
        case 3:
            return 'bottom center';
        case 4:
            return 'right center';
        case 5:
            return 'left center';
        default:
            return 'top center';
    }
}

function getOppositeTransformOrigin(cornerNumberToHighlight) {
    switch (cornerNumberToHighlight) {
        case 1:
        case 2:
        case 3:
            return 'top center';
        case 4:
            return 'left center';
        case 5:
            return 'right center';
        default:
            return 'bottom center';
    }
}

function scaleRectangle(rectangle, scale, cornerNumberToHighlight, computedTransform) {
    switch (cornerNumberToHighlight) {
        case 1:
        case 3:
        case 6:
        case 8:
            rectangle.style.transform = computedTransform + `scaleY(${100 * scale})`;
            break;
        case 2:
        case 7:
            rectangle.style.transform = `scaleY(${scale})`;
            break;
        default:
            rectangle.style.transform = `scaleX(${scale})`;
    }
}

function getOriginalTransform(rectangle) {
    return getComputedStyle(rectangle).getPropertyValue("transform");
}

function stop() {
    doFootwork = false;
    toggleVisibleElements();
    for (const corner of disabledCornerArray) {
        corner.classList.toggle("hidden");
    }
}

function toggleVisibleElements() {
    document.getElementById("start-button").classList.toggle("hidden");
    document.getElementById("stop-button").classList.toggle("hidden");
    document.getElementById("bottom-button").classList.toggle("hidden");
    document.getElementById("timer").classList.toggle("hidden");
}

function toggleStopSwitch() {
    stopSwitch = !stopSwitch;
}