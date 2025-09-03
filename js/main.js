// ===============================
// Generador de Bases de Datos
// ===============================

let entityCount = 0;
let relations = [];
let attributeGlobalId = 0;

const allowedChars = /^[a-zA-Z0-9_]+$/;

// ===============================
// Utilidades
// ===============================

function showError(msg) {
    console.error(msg);
    // ⚡ Mejor UX: mostrar errores en pantalla
    const errorBox = document.getElementById("error-box");
    if (errorBox) {
        errorBox.textContent = msg;
        errorBox.style.display = "block";
    } else {
        alert(msg);
    }
}

function clearError() {
    const errorBox = document.getElementById("error-box");
    if (errorBox) errorBox.style.display = "none";
}

// ===============================
// ENTIDADES
// ===============================

function addEntity() {
    clearError();
    entityCount++;

    const entityContainer = document.createElement("div");
    entityContainer.classList.add("entity");
    entityContainer.id = `entity-${entityCount}`;

    entityContainer.innerHTML = `
        <div class="entity-header">
            <input type="text" 
                   id="entity-name-${entityCount}" 
                   placeholder="Nombre de la Entidad" 
                   onblur="validateEntityName(${entityCount})">
            <div>
                <button class="btn" onclick="addAttribute(${entityCount})">+ Atributo</button>
                <button class="btn btn-red" onclick="removeEntity(${entityCount})">Eliminar</button>
            </div>
        </div>
        <div id="attributes-container-${entityCount}"></div>
    `;

    document.getElementById("entities-container").appendChild(entityContainer);
    updateRelationSelectors();
    checkEntitiesForRelations();
}

function validateEntityName(entityId) {
    const input = document.getElementById(`entity-name-${entityId}`);
    const name = input.value.trim();
    const existingNames = [...document.querySelectorAll('input[id^="entity-name-"]')]
        .map(e => e.value.trim().toLowerCase())
        .filter(n => n !== "");

    if (!allowedChars.test(name)) {
        showError("El nombre solo puede contener letras, números y guiones bajos.");
        input.value = "";
    } else if (existingNames.filter(n => n === name.toLowerCase()).length > 1) {
        showError("El nombre de la entidad debe ser único.");
        input.value = "";
    }
}

function removeEntity(entityId) {
    const el = document.getElementById(`entity-${entityId}`);
    if (el) el.remove();
    updateRelationSelectors();
    checkEntitiesForRelations();
}

// ===============================
// ATRIBUTOS
// ===============================

function addAttribute(entityId) {
    clearError();

    const entityNameInput = document.getElementById(`entity-name-${entityId}`);
    if (!entityNameInput.value.trim()) {
        showError("Nombra la entidad antes de añadir atributos.");
        return;
    }

    attributeGlobalId++;
    const attributesContainer = document.getElementById(`attributes-container-${entityId}`);

    const attribute = document.createElement("div");
    attribute.classList.add("attribute");
    attribute.innerHTML = `
        <input type="text" placeholder="Nombre del atributo" 
               id="attribute-${attributeGlobalId}" 
               onblur="validateAttributeName(${attributeGlobalId})">

        <select id="datatype-${attributeGlobalId}" 
                onchange="updateDataTypeVisibility(${attributeGlobalId})">
            <option value="INT">INT</option>
            <option value="FLOAT">FLOAT</option>
            <option value="VARCHAR">VARCHAR</option>
            <option value="TEXT">TEXT</option>
            <option value="BOOLEAN">BOOLEAN</option>
            <option value="DATE">DATE</option>
            <option value="JSON">JSON</option>
        </select>

        <input type="number" min="1" placeholder="Longitud" 
               id="length-${attributeGlobalId}" 
               style="width: 80px; display: none;">

        <label>
            <input type="checkbox" id="pk-${attributeGlobalId}"> PK
        </label>

        <button class="btn btn-red" onclick="removeAttribute(this)">X</button>
    `;

    attributesContainer.appendChild(attribute);
    updateRelationSelectors();
}

function validateAttributeName(attrId) {
    const input = document.getElementById(`attribute-${attrId}`);
    if (input && !allowedChars.test(input.value.trim())) {
        showError("El nombre solo puede contener letras, números y guiones bajos.");
        input.value = "";
    }
}

function updateDataTypeVisibility(attrId) {
    const select = document.getElementById(`datatype-${attrId}`);
    const lengthInput = document.getElementById(`length-${attrId}`);
    if (!select || !lengthInput) return;
    lengthInput.style.display = select.value === "VARCHAR" ? "inline-block" : "none";
}

function removeAttribute(button) {
    button.closest(".attribute").remove();
    updateRelationSelectors();
}

// ===============================
// RELACIONES
// ===============================

function updateRelationSelectors() {
    const relationEntity1 = document.getElementById("relation-entity-1");
    const relationEntity2 = document.getElementById("relation-entity-2");
    const relationAttribute1 = document.getElementById("relation-attribute-1");
    const relationAttribute2 = document.getElementById("relation-attribute-2");

    const selects = [relationEntity1, relationEntity2];
    selects.forEach(s => (s.innerHTML = "<option value=''>Seleccionar Entidad</option>"));

    [...document.querySelectorAll(".entity")].forEach(entity => {
        const id = entity.id;
        const name = entity.querySelector("input").value.trim();
        if (!name) return;

        const opt1 = new Option(name, id);
        const opt2 = new Option(name, id);
        relationEntity1.add(opt1);
        relationEntity2.add(opt2);
    });

    relationEntity1.onchange = () => updateAttributeSelector(relationAttribute1, relationEntity1.value);
    relationEntity2.onchange = () => updateAttributeSelector(relationAttribute2, relationEntity2.value);
}

function updateAttributeSelector(attributeSelect, entityId) {
    attributeSelect.innerHTML = "<option value=''>Seleccionar Atributo</option>";
    if (!entityId) return;

    const inputs = document.querySelectorAll(`#${entityId} .attribute input[type=text]`);
    inputs.forEach(input => {
        if (!input.value.trim()) return;
        attributeSelect.add(new Option(input.value, input.id));
    });
}

function addRelation() {
    const e1 = document.getElementById("relation-entity-1").value;
    const e2 = document.getElementById("relation-entity-2").value;
    const a1 = document.getElementById("relation-attribute-1").value;
    const a2 = document.getElementById("relation-attribute-2").value;

    if (!e1 || !e2 || !a1 || !a2) {
        showError("Selecciona entidades y atributos válidos.");
        return;
    }

    const entity1Name = document.getElementById(e1).querySelector("input").value;
    const entity2Name = document.getElementById(e2).querySelector("input").value;
    const attr1Name = document.getElementById(a1).value;
    const attr2Name = document.getElementById(a2).value;

    relations.push({ entity1: entity1Name, attribute1: attr1Name, entity2: entity2Name, attribute2: attr2Name });
    clearError();
    alert(`Relación añadida entre ${entity1Name}.${attr1Name} → ${entity2Name}.${attr2Name}`);
}

function checkEntitiesForRelations() {
    const relationContainer = document.getElementById("relation-container");
    relationContainer.style.display = document.querySelectorAll(".entity").length >= 2 ? "block" : "none";
}

// ===============================
// GENERACIÓN SQL
// ===============================

function generateDatabase() {
    clearError();
    let sql = "";

    [...document.querySelectorAll(".entity")].forEach(entity => {
        const name = entity.querySelector("input").value.trim();
        if (!name) return showError("Nombra todas las entidades antes de generar SQL.");

        sql += `CREATE TABLE ${name} (\n`;

        const attrs = [...entity.querySelectorAll(".attribute")].map(attr => {
            const attrName = attr.querySelector("input[type=text]").value.trim();
            const type = attr.querySelector("select").value;
            const length = attr.querySelector("input[type=number]").value;
            const pk = attr.querySelector("input[type=checkbox]").checked;

            let definition = `  ${attrName} ${type}`;
            if (type === "VARCHAR" && length) definition += `(${length})`;
            if (pk) definition += " PRIMARY KEY";

            return definition;
        });

        sql += attrs.join(",\n") + "\n);\n\n";
    });

    relations.forEach(r => {
        sql += `ALTER TABLE ${r.entity2} ADD CONSTRAINT fk_${r.entity2}_${r.entity1} FOREIGN KEY (${r.attribute2}) REFERENCES ${r.entity1}(${r.attribute1});\n\n`;
    });

    document.getElementById("sql-output").value = sql;
}

// ===============================
// DOCUMENTACIÓN
// ===============================

function generateDocumentation() {
    let md = "# Documentación de la Base de Datos\n\n";

    [...document.querySelectorAll(".entity")].forEach(entity => {
        const name = entity.querySelector("input").value.trim();
        if (!name) return;

        md += `## ${name}\n| Atributo | Tipo |\n|----------|------|\n`;

        entity.querySelectorAll(".attribute").forEach(attr => {
            const attrName = attr.querySelector("input[type=text]").value.trim();
            const type = attr.querySelector("select").value;
            const pk = attr.querySelector("input[type=checkbox]").checked ? " (PK)" : "";
            md += `| ${attrName}${pk} | ${type} |\n`;
        });

        md += "\n---\n\n";
    });

    document.getElementById("documentation-output").value = md;
    alert("Documentación generada.");
}

// ===============================
// DESCARGAS
// ===============================

function downloadSQL() {
    const sql = document.getElementById("sql-output").value;
    if (!sql) return showError("No hay SQL para descargar.");
    const blob = new Blob([sql], { type: "text/sql" });
    triggerDownload(blob, "database.sql");
}

function downloadDocumentation() {
    const md = document.getElementById("documentation-output").value;
    if (!md) return showError("No hay documentación para descargar.");
    const blob = new Blob([md], { type: "text/markdown" });
    triggerDownload(blob, "documentacion.md");
}

function triggerDownload(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// ===============================
// LIMPIAR
// ===============================

function clearAll() {
    document.getElementById("entities-container").innerHTML = "";
    document.getElementById("sql-output").value = "";
    document.getElementById("documentation-output").value = "";
    entityCount = 0;
    attributeGlobalId = 0;
    relations = [];
    updateRelationSelectors();
    checkEntitiesForRelations();
}
