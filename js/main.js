var surveyData = [];
var alphabet = ["A","B","C","D","E","F","G","H","I","J","K"];

var formatPerc = d3.format(".0%");

function getSurveyData() {
  d3.csv("data/health_survey_cbhfa_training_2014_06_18.csv", function(data){
    surveyData = data;
    analyzeData();
  });
}

function analyzeData() {
  $.each(surveyInfo, function(questionIndex, question){
    if (question["analysis"] === "atLeastThree") {
      atLeastThree(question);
    }
    if (question["analysis"] === "yesNo") {
      yesNo(question);
    }
    if (question["analysis"] === "allNone") {
      allNone(question);
    }
    if (question["analysis"] === "logProblems") {
      logProblems(question);
    }

  });
}

function yesNo(question) {
  var questionID = question["questionID"];
  var yesCount = 0;
  var noCount = 0;
  var skipped = 0;
  $.each(surveyData, function(surveyIndex, survey){
    if (survey[questionID] === "yes"){
      yesCount ++;
    }
    if (survey[questionID] === "no"){
      noCount ++;
    }
    if (survey[questionID] === "skip"){
      skipped ++;
    }
  });
  var thisPieData = [
    {
      key: "Yes",
      y: yesCount,
    },
    {
      key: "No",
      y: noCount,
    }
  ];
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var totalLessSkipped = surveyData.length - skipped;
  var yesPerc = formatPerc(yesCount / totalLessSkipped); 
  var noPerc = formatPerc(noCount / totalLessSkipped);
  thisInfoHtml = "<h4>" + question["questionEnglish"] +
    "<br><small>" + question["questionTagalog"] + "</small></h4>" +
    "<p><span class='percText-dark'>" + yesPerc + "</span> answered Yes / Oo | " +
    yesCount.toString() + ((yesCount == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" + noPerc + "</span> answered No / Hindi | " + 
    noCount.toString() + ((noCount == 1) ? " interviewee" : " interviewees") + "<br>" + 
    "(" + skipped.toString() + ((skipped == 1) ? " interviewee" : " interviewees") + " chose not to answer)</p>";
  $(infoSelector).append(thisInfoHtml);   
}

function atLeastThree(question) {
  var questionID = question["questionID"];
  var optionCount = question["optionCount"];
  var atLeastThree = 0;
  var lessThanThree = 0;
  var dontKnow = 0;
  var skipped = 0;
  var dk = questionID + "_dk";
  var skip = questionID + "_skip";
  var answersArray = [];
  for(var i = 0; i < optionCount; i++){
    answersArray.push(questionID + "_" + alphabet[i]);
  }
  var allResponses = [];
  for (responseOption in question["answersEnglish"]){
    allResponses[responseOption] = 0;
  }
  $.each(surveyData, function(surveyIndex, survey){
    // counts for each of the responses
    for (response in allResponses){
      if (survey[response] === "TRUE"){
        allResponses[response] ++;
      }
    };
    
    // counts for analysis chart  
    if (survey[dk] === "TRUE"){
      dontKnow ++;
      lessThanThree ++;
    } else if (survey[skip] === "TRUE"){
      skipped ++;
    } else {
      var thisTrueCount = 0;
      $.each(answersArray, function(answerIndex, answer){
        if (survey[answer] === "TRUE"){
          thisTrueCount ++;
        }
      });
      if (thisTrueCount >= 3){
        atLeastThree ++;
      } 
      if (thisTrueCount < 3){
        lessThanThree ++;
      }
    } 
  });
  var thisPieData = [
    {
      key: "At least 3",
      y: atLeastThree,
    },
    {
      key: "Less than 3",
      y: lessThanThree,
    }
  ];  
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var totalLessSkipped = surveyData.length - skipped;
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var atLeastThreePerc = formatPerc(atLeastThree / totalLessSkipped); 
  var lessThanThreePerc = formatPerc(lessThanThree / totalLessSkipped);
  var dontKnowPerc = formatPerc(dontKnow / totalLessSkipped);
  thisInfoHtml = "<h4>" + question["questionEnglish"] +
    "<br><small>" + question["questionTagalog"] + "</small></h4>" +
    "<p><span class='percText-dark'>" + atLeastThreePerc + "</span> could identify at least three" + 
    " | " + atLeastThree.toString() + ((atLeastThree == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" +lessThanThreePerc + "</span> could identify less than three or didn't know" + 
    " | " + lessThanThree.toString() + ((lessThanThree == 1) ? " interviewee" : " interviewees") + "<br>" +
    "(" + dontKnowPerc + " of total didn't know | " +
    dontKnow.toString() + ((dontKnow == 1) ? " interviewee" : " interviewees") + ")<br>" +
    "(" + skipped.toString() + ((skipped == 1) ? " interviewee" : " interviewees") + " chose not to answer)</p>";

  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>Raw Counts of Responses</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponseEng = question["answersEnglish"][response];
    var thisResponseTag = question["answersTagalog"][response];
    thisHtml = thisResponseCount + " - " + thisResponseEng + " <span class='text-tagalog'>[" + thisResponseTag + "]</span><br>";
    $(infoSelector).append(thisHtml);
  }  
}

function allNone(question) {
  var questionID = question["questionID"];
  var optionCount = question["optionCount"];
  var all = 0;
  var none = 0;
  var dontKnow = 0;
  var skipped = 0;
  var dk = questionID + "_dk";
  var skip = questionID + "_skip";
  var answersArray = [];
  for(var i = 0; i < optionCount; i++){
    answersArray.push(questionID + "_" + alphabet[i]);
  }
  var allResponses = [];
  for (responseOption in question["answersEnglish"]){
    allResponses[responseOption] = 0;
  }
  $.each(surveyData, function(surveyIndex, survey){
    // counts for each of the responses
    for (response in allResponses){
      if (survey[response] === "TRUE"){
        allResponses[response] ++;
      }
    };
    
    // counts for analysis chart  
    if (survey[dk] === "TRUE"){
      dontKnow ++;
      none ++;
    } else if (survey[skip] === "TRUE"){
      skipped ++;
    } else {
      var thisTrueCount = 0;
      $.each(answersArray, function(answerIndex, answer){
        if (survey[answer] === "TRUE"){
          thisTrueCount ++;
        }
      });
      if (thisTrueCount === optionCount){
        all ++;
      } 
      if (thisTrueCount < optionCount){
        none ++;
      }
    } 
  });
  var thisPieData = [
    {
      key: "Know all",
      y: all,
    },
    {
      key: "Don't know all",
      y: none,
    }
  ];  
  $("#infoWrapper").append('<div class="row"><div id="' + 
    questionID + '" class="box-chart"><svg id="' +
    questionID + '_chart"></svg></div><div id="'+
    questionID + '_info" class="box-info"></div></div><hr>');
  var width = 180;
  var chart = nv.models.pie().width(width - 60).height(width - 60)
    .x(function(d) { return d.key }) 
    .y(function(d) { return d.y })
    .showLabels(true);
  var chartSelector = "#" + questionID + "_chart";
  d3.select(chartSelector)
    .datum(thisPieData)
    .transition().duration(1200)
    .attr('width', width)
    .attr('height', width)
    .call(chart);
  var el = $(".nv-pieLabels");
  $.each(el, function(aIndex, a){
    a.parentNode.appendChild(a);
  });
  var totalLessSkipped = surveyData.length - skipped;
  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  var allPerc = formatPerc(all / totalLessSkipped); 
  var nonePerc = formatPerc(none / totalLessSkipped);
  var dontKnowPerc = formatPerc(dontKnow / totalLessSkipped);
  thisInfoHtml = "<h4>" + question["questionEnglish"] +
    "<br><small>" + question["questionTagalog"] + "</small></h4>" +
    "<p><span class='percText-dark'>" + allPerc + "</span> could identify all " + 
    " | " + all.toString() + ((all == 1) ? " interviewee" : " interviewees") + "<br>" +
    "<span class='percText-light'>" + nonePerc + "</span> could identify less than all " +
    " | " + none.toString() + ((none == 1) ? " interviewee" : " interviewees") + "<br>" +
    "(" + dontKnowPerc + " of total didn't know | " +
    dontKnow.toString() + ((dontKnow == 1) ? " interviewee" : " interviewees") + ")<br>" +
    "(" + skipped.toString() + ((skipped == 1) ? " interviewee" : " interviewees") + " chose not to answer)</p>";

  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>Raw Counts of Responses</strong><br>");
  for(response in allResponses){
    var thisResponseCount = allResponses[response];
    var thisResponseEng = question["answersEnglish"][response];
    var thisResponseTag = question["answersTagalog"][response];
    thisHtml = thisResponseCount + " - " + thisResponseEng + " <span class='text-tagalog'>[" + thisResponseTag + "]</span><br>";
    $(infoSelector).append(thisHtml);
  }  
}

function logProblems(question){
  var questionID = question["questionID"];
  var optionCount = question["optionCount"];
  var answersArray = [];
  for(var i = 1; i <= optionCount; i++){
    answersArray.push(questionID + "_" + i);
  }
  var responseTexts = [];
  $.each(surveyData, function(surveyIndex, survey){
    $.each(answersArray, function(answerIndex, answer){
      if(survey[answer] != "n/a" && survey[answer] != "999"){
        responseTexts.push(survey[answer]);
      }
    });
  });
  $("#infoWrapper").append('<div class="row"><div id="' + 
  questionID + '" class="box-chart"><svg id="' +
  questionID + '_chart"></svg></div><div id="'+
  questionID + '_info" class="box-info"></div></div><hr>');

  var infoSelector = "#" + questionID + "_info";
  var thisInfoHtml = "";
  thisInfoHtml = "<h4>" + question["questionEnglish"] +
    "<br><small>" + question["questionTagalog"] + "</small></h4>";
  $(infoSelector).append(thisInfoHtml);
  $(infoSelector).append("<strong>Responses</strong><br>");
  $.each(responseTexts, function(rIndex, r){
    //finsh this!
    thisHtml = r + ", ";
    $(infoSelector).append(thisHtml);
  });  

}



getSurveyData();