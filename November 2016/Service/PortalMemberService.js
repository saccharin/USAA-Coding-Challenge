class PortalMemberService extends AbstractService
{
	constructor(dynamo, event, context) {
		super(dynamo, event, context);
	}

	getTableName() {
		return "Portal_Members";
	}
}