/*
    Scriptable UV Index Stuttgart Widget
    Inspiriert vom Corona Index Widget von Kevin Kub (https://github.com/kevinkub)
*/

class UVIndexWidget {

    async run() {
        let widget = await this.createWidget()
        if (!config.runsInWidget) {
            await widget.presentSmall()
        }
        Script.setWidget(widget)
        Script.complete()
    }

    getUVIndexColor(uvindex) {
        // Farben angelehnt an https://www.stadtklima-stuttgart.de/UV-Index-UVI.htm
        if (uvindex < 3) {
            return new Color('#99FFA7FF');
        } else if (uvindex < 6) {
            return new Color('#F1FFA1FF');
        } else if (uvindex < 8) {
            return new Color('#FFC587FF');
        } else if (uvindex < 11) {
            return new Color('#FF8A97FF');
        }
        return new Color('#FF9CFFFF');
    }

    async createWidget(items) {
        let data = await this.getData()

        // Basic widget setup
        let list = new ListWidget()
        list.setPadding(0, 0, 0, 0)
        list.backgroundColor = new Color('#242526');

        let textStack = list.addStack()
        textStack.setPadding(14, 14, 0, 14)
        textStack.layoutVertically()
        textStack.topAlignContent()

        // Header
        let header = textStack.addText("☀️ UV Index".toUpperCase())
        header.font = Font.mediumSystemFont(13)
        header.textColor = new Color('#888888');
        textStack.addSpacer()

        if (data.error) {
            // Error handling
            let loadingIndicator = textStack.addText(data.error.toUpperCase())
            textStack.setPadding(14, 14, 14, 14)
            loadingIndicator.font = Font.mediumSystemFont(13)
            loadingIndicator.textOpacity = 0.5
            let spacer = textStack.addStack()
            spacer.addSpacer();
        } else {
            // 5 Minuten Caching
            list.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000)

            let uvIndexStack = textStack.addStack();
            uvIndexStack.layoutVertically();
            uvIndexStack.setPadding(2, 4, 2, 4)

            let uvIndexElement = uvIndexStack.addText(data.uvIndex.toString());
            uvIndexElement.font = Font.boldSystemFont(24);
            uvIndexElement.textColor = this.getUVIndexColor(data.uvIndex);

            let updatedAt = uvIndexStack.addText(data.updatedAt);
            updatedAt.font = Font.lightSystemFont(15);
            updatedAt.textColor = new Color('#888888');

            uvIndexStack.addSpacer(1);

        }
        return list
    }

    async getData() {
        try {
            let currentData = await new Request('https://www.stadtklima-stuttgart.de/index.php?klima_uv-index').loadString();
            let uvIndex = currentData.split('Umweltschutz</strong>:</td>')[1].split('<strong>')[1].split('<')[0];
            let updatedAt = currentData.split('(Stand: ')[1].split(', ')[1].split(',')[0];
            return {
                uvIndex: parseFloat(uvIndex),
                updatedAt: updatedAt
            };

        } catch (e) {
            return {
                error: "Fehler bei Datenabruf."
            };
        }
    }
}


await new UVIndexWidget().run();