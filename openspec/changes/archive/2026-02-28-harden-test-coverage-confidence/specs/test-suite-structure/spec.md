## MODIFIED Requirements

### Requirement: Action-level coverage SHALL include success and failure cases

For each tested action in service, controller, and repository layers, the test suite SHALL include at least one success scenario and relevant failure scenarios (such as not found or invalid input) when applicable to that action contract. For mutation actions (`create`, `update`, `delete/destroy`, `publish`), tests SHALL also cover at least one negative-path input or result condition tied to the action boundary.

#### Scenario: Update action coverage

- **WHEN** update action tests are reviewed
- **THEN** they cover at least a successful update and a failure condition applicable to the layer contract

#### Scenario: Delete action coverage

- **WHEN** delete/destroy action tests are reviewed
- **THEN** they cover the action outcome for both existing and non-existing resource cases when the contract distinguishes them

#### Scenario: Mutation negative-path coverage

- **WHEN** mutation action tests are reviewed
- **THEN** each mutation action includes at least one explicit negative-path scenario at the action boundary
