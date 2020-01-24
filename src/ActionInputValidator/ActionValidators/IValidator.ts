export interface IValidator {
    validate() : void | Promise<void>;
}