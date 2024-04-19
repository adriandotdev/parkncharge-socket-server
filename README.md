# Socket Server

## Socket URL

`ws://192.46.227.227:4006?ev_charger_id='value'`

> **NOTE: You must pass the UID of the EV Charger when connecting to this server.**

## Server Events

### ON `charger-status`

This will return the current status of the charger.

**Expected Data**

```json
{
	"connection_id": "49db5116-d931-421d-b68a-fdd875d20252",
	"ev_charger_id": "<ev_charger_id>",
	"status": "ONLINE"
}
```

**Other status for charger**

- **PLUGGED-IN**
- **CHARGING**
- **ONLINE**
- **UNPLUGGED-ONLINE**

---

### ON `charging-status`

This will return the status of charging session.

**Expected Data**

```json
{
	"connection_id": "629705fe-63a5-4589-ac71-1764dbb44ae9",
	"ev_charger_id": 2,
	"transactionId": 982,
	"kwh_used": 0,
	"time_used": "00:00:37",
	"price": 0,
	"remaining_balance": 513186.22
}
```

---

### ON `charging-stop-details`

This will return all information when charging stops.

**Expected Data**

```json
{
	"connection_id": "629705fe-63a5-4589-ac71-1764dbb44ae9",
	"ev_charger_id": 2,
	"transactionId": 982,
	"kwh_used": 0,
	"time_used": "00:00:37",
	"price": 0,
	"remaining_balance": 513186.22
}
```

---

## Client Events to Listen

- ### **charging-status**
- ### **charger-status**
- ### **charging-stop-details**
- ### **charging-overstay**
- ### **unplugged-charger**
