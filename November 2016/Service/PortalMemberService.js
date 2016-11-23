class PortalMemberService extends AbstractService
{
	constructor(dynamo, event, context, callback) {
		super(dynamo, event, context, callback);
	}

	getTableName() {
		return "Portal_Members";
	}
}