var AWS = require('aws-sdk');
var DOC = require('dynamodb-doc');
var dynamo = new DOC.DynamoDB();

function getScore(searchterm, member) {
    if(typeof member.score !== 'undefined')
        return member.score;
    
	var score = 0;

    if(member.id === searchterm)
        return 10;
    
	function evaluateWord(search, word) {
		if(word === null || word.length === 0)
			return 0;

		var s = 0;

		if(word.indexOf(search) === 0)
			s += 1;
		if(word == search)
			s += 1;
		if(word.indexOf(search >= 0))
			s += 1;

		return s;
	}

	score += evaluateWord(searchterm, member.first_name_lowercase);
	score += evaluateWord(searchterm, member.last_name_lowercase);
	score += evaluateWord(searchterm, member.id);
    
    member.score = score;
    
	return score;
}

function parseTerms(term) {
	var terms = term.split(/[ ,]/);
	return terms.map((t) => { return t.replace(/[^-a-z0-9]/gi, '').trim(); }).filter((t) => { return t.length > 0 });
}

function buildFilterExpression(terms) {
	var expression = [];
	var attributeValues = {};
	for(var i=0;i<terms.length;i++) {
		var x = ':search' + i;
		var exp = '(begins_with (id, ' + x + ') OR contains (first_name_lowercase, ' + x + ')'
			+ ' OR contains (last_name_lowercase, ' + x + '))';
		expression.push(exp);
		attributeValues[x] = terms[i];
	}
	
	return {
		FilterExpression: expression.join(' AND '),
		ExpressionAttributeValues: attributeValues
	};
}
exports.handler = function(event, context) {
    var callback = function(err, data, statusCode) {
        if (err) {
            var body = err;
            if(body instanceof Error) {
                body = JSON.stringify(err, Object.getOwnPropertyNames(err));
            }
            console.error({
                statusCode: statusCode ? statusCode : '500',
                body: body
            });
            context.done(JSON.stringify({
                statusCode: statusCode ? statusCode : '500',
                body: body
            }));
        } else {
            if(!data.Items)
                context.done(null, {});
            
            data.Items.sort((a,b) => {
            	return getScore(searchterm, b) - getScore(searchterm, a);
            });
            if(data.Items.length > 12)
                data.Items.length = 12;
            
            context.done(null, data.Items.map((i) => {
                return {
                    id: i.id,
                    first_name: i.first_name,
                    last_name: i.last_name,
                    gender: i.gender
                };
            }));
        }
     };
 
    var searchterm = "";
    //console.log(event);
    if(event.body && event.body.search)
        searchterm = event.body.search.trim().toLowerCase();
    else {
        callback("You must post a Search Term parameter to this API (&search=...)");
        return;
    }
    
    var terms = parseTerms(searchterm);
    var exp = buildFilterExpression(terms);
     
     var params = {
         ProjectionExpression: "id,first_name,last_name,gender,first_name_lowercase,last_name_lowercase",
         TableName:"Portal_Members",
         //Limit: 10,
         FilterExpression: exp.FilterExpression,
            // "begins_with (id, :search)" + 
            // " OR contains (first_name_lowercase, :search)" +
            // " OR contains (last_name_lowercase, :search)",
        ExpressionAttributeValues: exp.ExpressionAttributeValues
        //  ExpressionAttributeValues: {
        //     ":search": searchterm
        //  }
    };
     
    dynamo.scan(params, callback);
};
