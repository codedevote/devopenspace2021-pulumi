import { expect } from "chai";
import * as automation from "./test-automation";
import * as superagent from "superagent";
import * as cheerio from "cheerio";

describe("Deploying a static website", () => {
    
    before(async () => {
        await automation.deploy();  // pulumi up
    });

    after(async () => {
        await automation.destroy(); // pulumi destroy
    });

    it("should return 200", async () => {
        await automation
            .getOutputs()
            .then((result) => result.htmlUrl.value)
            .then((url) => {
                expect(url).to.be.a("string");
                return superagent.get(url);
            })
            .then((response) => expect(response.statusCode).to.equal(200))
        });
    
    it("should return expected html", async () => {
        await automation
            .getOutputs()
            .then((result) => result.htmlUrl.value)
            .then((url) => {
                expect(url).to.be.a("string");
                return superagent.get(url);
            })
            .then((response) => response.text)
            .then((html) => {
                const dom = cheerio.load(html);
                expect(dom("title").text()).to.equal("Pulumi Workshop Static Website");
            });
    });    
});