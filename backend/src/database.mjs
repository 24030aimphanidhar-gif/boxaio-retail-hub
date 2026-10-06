import fs from "node:fs";
import path from "node:path";
export function createDatabase(filename, seeds) {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  let data = fs.existsSync(filename)
    ? JSON.parse(fs.readFileSync(filename, "utf8"))
    : { version: 1, workspaces: {} };
  if (data.version !== 1 || !data.workspaces)
    throw Error("Invalid database. Existing file was preserved.");
  function persist() {
    const temp = filename + ".tmp";
    fs.writeFileSync(temp, JSON.stringify(data, null, 2));
    fs.renameSync(temp, filename);
  }
  return {
    get(id) {
      if (!data.workspaces[id]) {
        data.workspaces[id] = {
          state: {
            boxaio_addresses: JSON.stringify(seeds.addresses),
            boxaio_customer_orders_v2: JSON.stringify(seeds.customerOrders),
            boxaio_b2b_orders_v1: JSON.stringify(seeds.wholesaleOrders),
            boxaio_retailer_db_v1: JSON.stringify(seeds.retailer),
          },
          ledger: { attempts: {}, orders: [], balances: {} },
        };
        persist();
      }
      return structuredClone(data.workspaces[id]);
    },
    save(id, value) {
      const previous = data.workspaces[id];
      data.workspaces[id] = structuredClone(value);
      try {
        persist();
      } catch (e) {
        data.workspaces[id] = previous;
        throw e;
      }
    },
  };
}
