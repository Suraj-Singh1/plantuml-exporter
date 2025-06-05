const { encode } = require("plantuml-encoder");

const code1 = `@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response
@enduml`;

const code2 = `@startuml
start
:Initialize system;
:Authenticate user;
stop
@enduml`;

const encoded1 = encode(code1);
const encoded2 = encode(code2);

console.log("Encoded 1:", encoded1);
console.log("Encoded 2:", encoded2);
